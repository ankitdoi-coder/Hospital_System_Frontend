import { useState, useEffect } from 'react';
import { getDoctors } from '../../Services/PatientService.js';

const DoctorsList = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const SIZE = 10;

    useEffect(() => {
        let cancelled = false;
        const fetchDoctors = async () => {
            setLoading(true);
            try {
                const response = await getDoctors(page, SIZE);
                if (cancelled) return;
                // Backend currently returns a plain array for this endpoint
                // rather than a paginated { content, totalPages } object.
                // Handle both so this doesn't silently break either way.
                const list = Array.isArray(response) ? response : (response?.content || []);
                setDoctors(list);
                setTotalPages(Array.isArray(response) ? 1 : (response?.totalPages || 1));
            } catch (error) {
                console.error('Failed to fetch doctors:', error);
                if (!cancelled) setDoctors([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetchDoctors();
        return () => { cancelled = true; };
    }, [page]);

    const filteredDoctors = (doctors || []).filter((doctor) => {
        if (!doctor) return false;
        const name = `${doctor.firstName || ''} ${doctor.lastName || ''}`.toLowerCase();
        const specialty = (doctor.specialty || '').toLowerCase();
        const term = searchTerm.toLowerCase();
        return name.includes(term) || specialty.includes(term);
    });

    // Backend field names for these two haven't been confirmed yet, so try
    // the most likely candidates in order and fall back gracefully.
    // TODO: once you confirm the real field names from the API response,
    // trim these down to the single correct key.
    const getProfilePicture = (doctor) =>
        doctor.profilePicture || doctor.profileImage || doctor.imageUrl || doctor.avatarUrl || doctor.photoUrl || null;

    const getExperience = (doctor) => {
        const val = doctor.experienceYears ?? doctor.experience ?? doctor.yearsOfExperience ?? doctor.yoe;
        return (val === undefined || val === null || val === '') ? null : val;
    };

    return (
        <div className="max-w-7xl mx-auto p-6 lg:p-8">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 mb-8">
                <h2 className="text-3xl font-bold text-white flex items-center space-x-3">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <span>Find a Doctor</span>
                </h2>
                <p className="text-purple-100 mt-2">Browse our directory of world-class specialists.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 mb-8">
                <div className="relative max-w-md">
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input
                        type="text"
                        placeholder="Search by name or specialty..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-11 pr-4 py-3 w-full border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-16">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-2 border-slate-200 border-t-purple-600 mb-4"></div>
                    <div className="text-slate-500 text-sm font-medium">Loading doctors...</div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredDoctors.length > 0 ? (
                            filteredDoctors.map((doctor) => {
                                const pfp = getProfilePicture(doctor);
                                const exp = getExperience(doctor);
                                return (
                                    <div key={doctor.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-lg shadow-slate-200/40 hover:shadow-purple-200/50 hover:-translate-y-1 transition-all group">
                                        <div className="flex items-center gap-4 mb-4">
                                            {pfp ? (
                                                <img
                                                    src={pfp}
                                                    alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
                                                    className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
                                                    onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
                                                />
                                            ) : null}
                                            <div
                                                className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 items-center justify-center text-2xl font-bold text-purple-700 flex-shrink-0"
                                                style={{ display: pfp ? 'none' : 'flex' }}
                                            >
                                                {doctor.firstName?.[0]}{doctor.lastName?.[0]}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800 text-lg leading-tight">Dr. {doctor.firstName} {doctor.lastName}</h3>
                                                <p className="text-sm text-purple-600 font-semibold">{doctor.specialty}</p>
                                            </div>
                                        </div>
                                        <div className="text-xs text-slate-500 space-y-1.5 pt-3 border-t border-slate-100">
                                            <p>Email: {doctor.email}</p>
                                            <p>Experience: {exp !== null ? `${exp} years` : 'N/A'}</p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="col-span-full text-center py-16 bg-slate-50 rounded-2xl">
                                <svg className="mx-auto h-16 w-16 text-slate-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                <h4 className="text-xl font-semibold text-slate-800 mb-2">No Doctors Found</h4>
                                <p className="text-slate-500">Your search for "{searchTerm}" did not match any doctors.</p>
                            </div>
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-3 mt-8">
                            <button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="px-4 py-2 rounded-lg text-sm font-semibold bg-white border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-slate-500 font-medium">
                                Page {page + 1} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={page >= totalPages - 1}
                                className="px-4 py-2 rounded-lg text-sm font-semibold bg-white border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default DoctorsList;