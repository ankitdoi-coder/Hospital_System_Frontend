import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setDoctors, setLoading } from '../../store/slices/doctorsSlice';
import { getDoctors } from '../../Services/PatientService.js';
import { Link } from 'react-router-dom';

const DoctorsList = () => {
    const dispatch = useAppDispatch();
    const { list: doctors, loading } = useAppSelector((state) => state.doctors);

    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const SIZE = 10;

    const fetchDoctors = async () => {
        try {
            dispatch(setLoading(true));
            // Backend se paginated response aa raha hai
            const data = await getDoctors(page, SIZE);
            
            // Slice mein sirf array (content) bhejo
            dispatch(setDoctors(data.content || []));
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            console.error('Failed to fetch doctors:', error);
        } finally {
            dispatch(setLoading(false));
        }
    };

    useEffect(() => {
        fetchDoctors();
    }, [page, dispatch]);

    const filteredDoctors = (doctors || []).filter((doctor) => {
        return (doctor.firstName?.toLowerCase() + ' ' + (doctor.lastName || '')).includes(searchTerm.toLowerCase());
    });

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Find Doctors</h2>
            
            <input
                type="text"
                placeholder="Search doctors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-6 p-2 border rounded w-full max-w-md"
            />

            {loading ? (
                <p>Loading...</p>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDoctors.length > 0 ? (
                            filteredDoctors.map((doctor) => (
                                <div key={doctor.id} className="p-4 border rounded shadow">
                                    <h3 className="font-bold text-lg">{doctor.firstName} {doctor.lastName}</h3>
                                    <p className="text-sm text-gray-600">{doctor.specialization}</p>
                                    {/* ... rest of doctor details ... */}
                                </div>
                            ))
                        ) : (
                            <p>No doctors found.</p>
                        )}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-8">
                            <button 
                                disabled={page === 0} 
                                onClick={() => setPage(p => p - 1)}
                                className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
                            >
                                Previous
                            </button>
                            <span>Page {page + 1} of {totalPages}</span>
                            <button 
                                disabled={page >= totalPages - 1} 
                                onClick={() => setPage(p => p + 1)}
                                className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
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