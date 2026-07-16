import React from 'react';

const SettingsPage = ({ forecastForm, setForecastForm }) => {
    return (
        <div className="bg-white rounded-xl shadow p-6 space-y-4">
            <div>
                <h2 className="text-xl font-semibold text-gray-800">⚙️ Settings</h2>
                <p className="text-sm text-gray-500">Configure the default alert behavior</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 space-y-3">
                <label className="block text-sm font-medium text-gray-700">Default flood threshold</label>
                <input type="number" step="0.1" value={forecastForm.threshold} onChange={(event) => setForecastForm({ ...forecastForm, threshold: event.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                <p className="text-sm text-gray-500">This value will be used as the default threshold for new predictions.</p>
            </div>
        </div>
    );
};

export default SettingsPage;
