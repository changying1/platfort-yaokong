import { useState, useEffect, useCallback, useMemo } from 'react';
import { alarmApi, AlarmResponse } from '@/src/api/alarmApi';
import { AlarmRecord, AlarmStatusFilter, AlarmLevelFilter } from '../types';

export const useAlarms = () => {
  const [alarms, setAlarms] = useState<AlarmRecord[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filter States
  const [statusFilter, setStatusFilter] = useState<AlarmStatusFilter>('all');
  const [levelFilter, setLevelFilter] = useState<AlarmLevelFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  // Unsaved local state for alarm levels
  const [localLevels, setLocalLevels] = useState<Record<number, string>>({});

  const mapResponseToAlarm = (a: AlarmResponse): AlarmRecord => ({
    id: `ALM-${new Date(a.timestamp).getFullYear()}${String(new Date(a.timestamp).getMonth() + 1).padStart(2, '0')}${String(new Date(a.timestamp).getDate()).padStart(2, '0')}-${String(a.id).padStart(3, '0')}`,
    rawId: a.id,
    user: a.device_id, 
    device: a.device_id,
    type: a.alarm_type,
    time: new Date(a.timestamp).toLocaleString(),
    location: a.location || '未知位置',
    status: a.status as 'pending' | 'resolved',
    level: (a.severity?.toLowerCase() || 'medium') as 'high' | 'medium' | 'low',
    description: a.description
  });

  const fetchAlarms = useCallback(async () => {
    setLoading(true);
    try {
      const data = await alarmApi.getAlarms();
      setAlarms(data.map(mapResponseToAlarm));
      // Optionally clear local levels that are no longer in the list or have been updated
    } catch (error) {
      console.error("Failed to fetch alarms:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlarms();
    const interval = setInterval(fetchAlarms, 30000); 
    return () => clearInterval(interval);
  }, [fetchAlarms]);

  const handleResolve = async (id: number) => {
    try {
      const finalLevel = localLevels[id];
      await alarmApi.updateAlarm(id, { 
        status: 'resolved',
        ...(finalLevel && { severity: finalLevel })
      });
      
      // Clear local level after successful save
      setLocalLevels(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      
      fetchAlarms();
    } catch (error) {
      console.error("Failed to resolve alarm:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这条报警记录吗？')) return;
    try {
      await alarmApi.deleteAlarm(id);
      fetchAlarms();
    } catch (error) {
      console.error("Failed to delete alarm:", error);
    }
  };

  const updateLevel = (id: number, level: string) => {
    // Just update local state, don't call API yet
    setLocalLevels(prev => ({ ...prev, [id]: level }));
  };

  // Compute stats
  const stats = useMemo(() => ({
    total: alarms.length,
    pending: alarms.filter(a => a.status === 'pending').length,
    resolved: alarms.filter(a => a.status === 'resolved').length,
    high: alarms.filter(a => a.level === 'high').length,
  }), [alarms]);

  // Compute filtered list with local level overrides
  const filteredAlarms = useMemo(() => {
    return alarms.map(alarm => ({
      ...alarm,
      // Priority: local unsaved change > server state
      level: (localLevels[alarm.rawId] || alarm.level) as any
    })).filter(alarm => {
      const matchStatus = statusFilter === 'all' || alarm.status === statusFilter;
      const matchLevel = levelFilter === 'all' || alarm.level === levelFilter;
      const matchSearch = searchTerm === '' || 
        alarm.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alarm.device.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alarm.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alarm.type.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchStatus && matchLevel && matchSearch;
    });
  }, [alarms, statusFilter, levelFilter, searchTerm, localLevels]);

  return {
    alarms: filteredAlarms,
    allRawAlarms: alarms,
    loading,
    stats,
    statusFilter,
    setStatusFilter,
    levelFilter,
    setLevelFilter,
    searchTerm,
    setSearchTerm,
    actions: {
      resolve: handleResolve,
      delete: handleDelete,
      updateLevel,
      refresh: fetchAlarms
    }
  };
};
