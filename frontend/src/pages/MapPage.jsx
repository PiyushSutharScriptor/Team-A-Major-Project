import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMapIssues } from '../store/slices/issueSlice';
import MapView from '../components/MapView';

const MapPage = () => {
  const dispatch = useDispatch();
  const { mapData, isLoading } = useSelector((state) => state.issues);

  useEffect(() => {
    dispatch(fetchMapIssues());
  }, [dispatch]);

  return (
    <div className="h-full flex flex-col space-y-4">
      <div>
        <h1 className="text-3xl font-extrabold text-white">City Operations Map</h1>
        <p className="text-slate-400 mt-1">Real-time geographical view of all active issues and assignments.</p>
      </div>

      <div className="flex gap-4">
        {/* Legend */}
        <div className="bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 flex gap-6 text-sm">
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500"></span><span className="text-slate-300">Pending</span></div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-500"></span><span className="text-slate-300">Assigned</span></div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500"></span><span className="text-slate-300">Resolved</span></div>
        </div>
      </div>

      <div className="flex-1 w-full relative rounded-xl overflow-hidden min-h-[600px] border border-dark-700">
        {isLoading && !mapData ? (
          <div className="absolute inset-0 z-10 bg-dark-900/80 backdrop-blur-sm flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <MapView geojson={mapData} height="absolute inset-0" />
        )}
      </div>
    </div>
  );
};

export default MapPage;
