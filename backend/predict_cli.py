import sys
import json
import pandas as pd
import numpy as np
import joblib
import os
from difflib import get_close_matches
from tensorflow.keras.models import load_model
from datetime import datetime, timedelta

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "ML_Models")

def get_available_stations():
    if not os.path.exists(MODEL_DIR):
        return []
    return [d for d in os.listdir(MODEL_DIR) if os.path.isdir(os.path.join(MODEL_DIR, d))]

def find_station(requested):
    available = get_available_stations()
    if not available:
        return None, available

    normalized_requested = requested.strip()

    if normalized_requested in available:
        return normalized_requested, available

    lower_requested = normalized_requested.lower()
    for station in available:
        if station.lower() == lower_requested:
            return station, available

    alias_map = {
        "hanwalla": "Hanwella",
        "hanwella": "Hanwella",
        "nstreet": "N'Street",
        "n'street": "N'Street",
        "deraniuagala": "Deraniuagala",
        "glencourse": "Glencourse",
        "holombuwa": "Holombuwa",
        "kithulgala": "Kithulgala",
        "norwood": "Norwood",
    }
    alias_match = alias_map.get(lower_requested)
    if alias_match:
        return alias_match, available

    close_matches = get_close_matches(lower_requested, [station.lower() for station in available], n=1, cutoff=0.7)
    if close_matches:
        matched_name = next(station for station in available if station.lower() == close_matches[0])
        return matched_name, available

    return None, available

def load_wl_data(filepath="Daily WL.xlsx"):
    if not os.path.exists(filepath):
        filepath = os.path.join(BASE_DIR, filepath)
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Water level data file not found: {filepath}")
    df = pd.read_excel(filepath, sheet_name='Sheet1', header=2)
    df.columns = ['Year', 'Month', 'Day'] + [f'WL_{c}' for c in df.columns[3:]]
    df['Date'] = pd.to_datetime(dict(year=df['Year'], month=df['Month'], day=df['Day']))
    df.set_index('Date', inplace=True)
    df.drop(columns=['Year', 'Month', 'Day'], inplace=True)
    df = df.sort_index().ffill()
    return df

MONTH_MAP = {
    "Jan":1, "Feb":2, "Mar":3, "Apr":4,
    "May":5, "Jun":6, "Jul":7, "Aug":8,
    "Sep":9, "Oct":10, "Nov":11, "Dec":12
}

def load_discharge_data(filepath="Discharge_Data.xlsx"):
    if not os.path.exists(filepath):
        filepath = os.path.join(BASE_DIR, filepath)
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Discharge data file not found: {filepath}")
    df = pd.read_excel(filepath)
    df.rename(columns={df.columns[0]: "YEARMONTH"}, inplace=True)
    df = df[df["YEARMONTH"].astype(str).str.lower() != "yearmonth"]
    df_melt = df.melt(id_vars=["YEARMONTH"], var_name="Day", value_name="Q")
    df_melt = df_melt.dropna()
    def parse_yearmonth(x):
        year, mon = str(x).split()
        return int(year), MONTH_MAP[mon]
    df_melt[["Year", "Month"]] = df_melt["YEARMONTH"].apply(lambda x: pd.Series(parse_yearmonth(x)))
    df_melt["DayNum"] = df_melt["Day"].str.extract(r"(\d+)").astype(int)
    df_melt["Date"] = pd.to_datetime(dict(year=df_melt["Year"], month=df_melt["Month"], day=df_melt["DayNum"]))
    df_melt = df_melt[["Date", "Q"]]
    df_melt = df_melt.drop_duplicates("Date").sort_values("Date").set_index("Date")
    return df_melt

def recursive_forecast(model, scaler_X, scaler_y, last_obs, feature_cols,
                       forecast_rain=None, lookback=10, forecast_days=5):
    if forecast_rain is None:
        forecast_rain = [0.0] * forecast_days
    elif len(forecast_rain) < forecast_days:
        forecast_rain = forecast_rain + [0.0] * (forecast_days - len(forecast_rain))

    last_obs = last_obs.sort_index()
    if len(last_obs) < lookback:
        raise ValueError(f"Need at least {lookback} days of recent data, got {len(last_obs)}")

    seq = last_obs[feature_cols].values[-lookback:]
    seq_scaled = scaler_X.transform(seq)

    q_idx = feature_cols.index("Q")
    rain_idx = feature_cols.index("Rainfall") if "Rainfall" in feature_cols else None
    q_scaled = seq_scaled[-1, q_idx]

    predictions = []
    for day in range(forecast_days):
        input_seq = seq_scaled[-lookback:].reshape(1, lookback, -1)
        pred_scaled = model.predict(input_seq, verbose=0).flatten()[0]
        predictions.append(pred_scaled)

        new_row = seq_scaled[-1].copy()
        new_row[q_idx] = q_scaled
        if rain_idx is not None:
            dummy = np.zeros((1, len(feature_cols)))
            dummy[0, rain_idx] = forecast_rain[day]
            rain_scaled = scaler_X.transform(dummy)[0, rain_idx]
            new_row[rain_idx] = rain_scaled

        seq_scaled = np.vstack([seq_scaled, new_row])[-lookback:]

    pred_values = scaler_y.inverse_transform(np.array(predictions).reshape(-1, 1)).flatten()
    return pred_values

def main():
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Usage: python predict_cli.py <station> <days> [threshold] [rain1,rain2,...]"}))
        sys.exit(1)

    requested_station = sys.argv[1]
    days = int(sys.argv[2])
    threshold = None
    rainfall = []

    if len(sys.argv) > 3:
        third_arg = sys.argv[3]
        if ',' in third_arg:
            rainfall = [float(x) for x in third_arg.split(',')]
        else:
            try:
                threshold = float(third_arg)
            except ValueError:
                rainfall = [float(x) for x in third_arg.split(',') if x]

    if len(sys.argv) > 4:
        rainfall = [float(x) for x in sys.argv[4].split(',') if x]

    if threshold is None:
        threshold = 1.5

    if not rainfall:
        rainfall = [0.0] * days

    try:
        station, available = find_station(requested_station)
        if station is None:
            error_msg = f"Station '{requested_station}' not found. Available: {', '.join(available)}"
            sys.stderr.write(error_msg + "\n")
            print(json.dumps({"error": error_msg}))
            sys.exit(1)

        target_col = f"WL_{station}"
        model_folder = os.path.join(MODEL_DIR, station)
        model_path = os.path.join(model_folder, f"lstm_flood_model_{target_col}.h5")
        scaler_X_path = os.path.join(model_folder, f"scaler_X_{target_col}.pkl")
        scaler_y_path = os.path.join(model_folder, f"scaler_y_{target_col}.pkl")

        sys.stderr.write(f"Using station: {station}\n")
        sys.stderr.write(f"Model path: {model_path}\n")

        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found at: {model_path}")

        model = load_model(model_path, compile=False)
        model.compile(optimizer='adam', loss='mse')
        scaler_X = joblib.load(scaler_X_path)
        scaler_y = joblib.load(scaler_y_path)

        df_wl = load_wl_data()
        df_q = load_discharge_data()
        df = df_wl.join(df_q, how="inner").sort_index().ffill().dropna()

        lookback = 10
        last_obs = df.iloc[-lookback:].copy()
        all_wl = [c for c in df.columns if c.startswith("WL_")]
        feature_cols = [c for c in all_wl if c != target_col] + ["Q"]

        pred_values = recursive_forecast(
            model, scaler_X, scaler_y, last_obs, feature_cols,
            forecast_rain=rainfall, lookback=lookback, forecast_days=days
        )

        # ===== DATE FIX: Use today's date as starting point =====
        today = datetime.now().date()
        start_date = today + timedelta(days=1)
        forecast_dates = [(start_date + timedelta(days=i)).isoformat() for i in range(days)]

        warning_items = []
        for index, value in enumerate(pred_values.tolist()):
            warning_items.append({
                "date": forecast_dates[index],
                "prediction": value,
                "threshold": threshold,
                "warning": bool(value >= threshold),
                "status": "warning" if value >= threshold else "normal"
            })

        result = {
            "station": station,
            "dates": forecast_dates,
            "predictions": pred_values.tolist(),
            "threshold": threshold,
            "warning": any(item["warning"] for item in warning_items),
            "status": "warning" if any(item["warning"] for item in warning_items) else "normal",
            "warnings": warning_items
        }
        print(json.dumps(result))
    except Exception as e:
        error_message = str(e)
        if "data file not found" in error_message.lower() or "model file not found" in error_message.lower():
            print(json.dumps({
                "error": error_message,
                "fallback": True,
                "station": station if 'station' in locals() else requested_station,
                "days": days,
                "rainfall": rainfall
            }))
        else:
            print(json.dumps({"error": error_message}))

if __name__ == "__main__":
    main()