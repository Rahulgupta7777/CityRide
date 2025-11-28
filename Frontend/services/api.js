const BASE_URL = 'http://localhost:3000';



const apiCall = async (endpoint) => {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        throw error;
    }
};

export const searchRoutes = (q) => apiCall(`/routes/search?q=${encodeURIComponent(q)}`);
export const getRouteDetails = (tripId) => apiCall(`/route/details?trip_id=${encodeURIComponent(tripId)}`);
