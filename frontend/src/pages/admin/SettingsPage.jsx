import React from 'react';
import { Settings, SlidersHorizontal, ShieldCheck, Waves } from 'lucide-react';

const SettingsPage = ({ forecastForm, setForecastForm }) => {
    return (
        <div className="space-y-6">
            <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#4318ff] to-[#7551ff] p-6 text-white shadow-lg shadow-indigo-200">
                <Waves className="absolute -right-4 -bottom-5 h-32 w-32 text-white/10" />
                <div className="relative flex items-start gap-4">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15"><Settings className="h-6 w-6" /></div>
                    <div><p className="text-sm font-semibold text-white/75">Workspace preferences</p><h2 className="mt-1 text-2xl font-bold">Prediction settings</h2><p className="mt-2 max-w-xl text-sm text-white/75">Set the default level that informs flood-risk evaluation across your forecasts.</p></div>
                </div>
            </section>
            <section className="max-w-2xl rounded-2xl border border-[#edf0f7] bg-white p-6 shadow-[0_4px_18px_rgba(112,144,176,0.07)]">
                <div className="flex items-center gap-3 border-b border-[#edf0f7] pb-5">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#f4f7fe] text-[#4318ff]"><SlidersHorizontal className="h-5 w-5" /></div>
                    <div><h3 className="font-bold text-[#2b3674]">Flood alert threshold</h3><p className="text-sm text-[#a3aed0]">Default value used for new predictions</p></div>
                </div>
                <label className="mt-6 block text-sm font-bold text-[#2b3674]">Water level (metres)</label>
                <div className="relative mt-2 max-w-sm"><input type="number" step="0.1" value={forecastForm.threshold} onChange={(event) => setForecastForm({ ...forecastForm, threshold: event.target.value })} className="w-full border border-[#e0e5f2] bg-[#f9fbff] px-4 py-3 pr-12 text-lg font-bold text-[#2b3674] outline-none transition focus:border-[#4318ff] focus:ring-4 focus:ring-indigo-100" /><span className="absolute right-4 top-3.5 text-sm font-bold text-[#a3aed0]">m</span></div>
                <div className="mt-6 flex gap-3 rounded-xl bg-[#f4f7fe] p-4 text-sm text-[#707eae]"><ShieldCheck className="h-5 w-5 shrink-0 text-[#4318ff]" /><p>This value is used as the default threshold for new predictions. Changes are applied instantly to the form.</p></div>
            </section>
        </div>
    );
};

export default SettingsPage;