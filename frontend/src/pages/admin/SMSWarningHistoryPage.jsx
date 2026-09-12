import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CalendarDays, Filter, MessageSquare, RefreshCw, Search, Trash2, Users } from 'lucide-react';
import api from '../../api/axios';

const SMSWarningHistoryPage = () => {
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stationFilter, setStationFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [recipientFilter, setRecipientFilter] = useState('');

  const fetchWarnings = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/sms/warnings');
      setWarnings(response.data.warnings || []);
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Unable to load SMS warning history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarnings();
  }, []);

  const stations = useMemo(() => [...new Set(warnings.map((warning) => warning.station).filter(Boolean))], [warnings]);

  const filteredWarnings = useMemo(() => warnings.filter((warning) => {
    const stationMatches = stationFilter === 'all' || warning.station === stationFilter;
    const warningDate = warning.createdAt ? new Date(warning.createdAt).toISOString().slice(0, 10) : '';
    const dateMatches = !dateFilter || warningDate === dateFilter;
    const search = recipientFilter.trim().toLowerCase();
    const recipientMatches = !search || (warning.recipients || []).some((recipient) => (
      [recipient.name, recipient.phone, recipient.email].some((value) => String(value || '').toLowerCase().includes(search))
    ));

    return stationMatches && dateMatches && recipientMatches;
  }), [warnings, stationFilter, dateFilter, recipientFilter]);

  const phoneRecipientCount = useMemo(() => new Set(
    filteredWarnings.flatMap((warning) => (warning.recipients || []).map((recipient) => recipient.phone).filter(Boolean))
  ).size, [filteredWarnings]);

  const deleteWarning = async (warningId) => {
    if (!window.confirm('Delete this SMS warning record? This will not recall any sent SMS.')) return;

    try {
      await api.delete(`/sms/warnings/${warningId}`);
      setWarnings((currentWarnings) => currentWarnings.filter((warning) => warning._id !== warningId));
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Unable to delete SMS warning.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-50 p-3 text-violet-600"><MessageSquare className="h-6 w-6" /></div>
            <div><p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-500">Notifications</p><h2 className="text-2xl font-bold text-slate-800">SMS Warning History</h2></div>
          </div>
          <button onClick={fetchWarnings} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Refresh</button>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <label className="text-sm font-medium text-slate-600">Station<select value={stationFilter} onChange={(event) => setStationFilter(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-violet-500"><option value="all">All stations</option>{stations.map((station) => <option key={station} value={station}>{station}</option>)}</select></label>
          <label className="text-sm font-medium text-slate-600">Sent date<input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-violet-500" /></label>
          <label className="text-sm font-medium text-slate-600">Recipient name, phone, or email<div className="relative mt-1.5"><Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input value={recipientFilter} onChange={(event) => setRecipientFilter(event.target.value)} placeholder="Search recipients" className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-violet-500" /></div></label>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4"><Filter className="h-5 w-5 text-violet-600" /><p className="mt-3 text-2xl font-bold text-slate-800">{filteredWarnings.length}</p><p className="text-sm text-slate-500">Warning records</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4"><Users className="h-5 w-5 text-emerald-600" /><p className="mt-3 text-2xl font-bold text-slate-800">{phoneRecipientCount}</p><p className="text-sm text-slate-500">Unique phone recipients</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4"><MessageSquare className="h-5 w-5 text-blue-600" /><p className="mt-3 text-2xl font-bold text-slate-800">{filteredWarnings.reduce((total, warning) => total + (warning.sentCount || 0), 0)}</p><p className="text-sm text-slate-500">SMS sent</p></div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
        {error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
        {loading ? <p className="py-10 text-center text-sm text-slate-400">Loading SMS warning history...</p> : filteredWarnings.length === 0 ? <p className="py-10 text-center text-sm text-slate-400">No SMS warnings match these filters.</p> : (
          <div className="space-y-3">
            {filteredWarnings.map((warning) => (
              <article key={warning._id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:justify-between">
                  <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-slate-800">{warning.station}</h3><span className="rounded-full bg-violet-50 px-2 py-0.5 text-xs font-semibold text-violet-700">{warning.sentCount} sent</span>{warning.failedCount > 0 && <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">{warning.failedCount} failed</span>}</div><p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{warning.message}</p><p className="mt-3 flex items-center gap-1 text-xs text-slate-400"><CalendarDays className="h-3.5 w-3.5" />{new Date(warning.createdAt).toLocaleString()}</p></div>
                  <button onClick={() => deleteWarning(warning._id)} className="inline-flex h-fit items-center justify-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" />Delete</button>
                </div>
                <div className="mt-4 border-t border-slate-100 pt-3"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Recipients with phone numbers ({warning.recipients?.filter((recipient) => recipient.phone).length || 0})</p><div className="mt-2 flex flex-wrap gap-2">{(warning.recipients || []).map((recipient, index) => <span key={`${recipient.phone}-${index}`} className={`rounded-lg px-2 py-1 text-xs ${recipient.status === 'sent' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>{recipient.name || 'User'} · {recipient.phone} · {recipient.status}</span>)}</div></div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SMSWarningHistoryPage;