import { useState, useEffect, useCallback, useRef } from 'react';
import type { AgentDb } from '../lib/agent';

export function useAgent() {
  const [data, setData] = useState<AgentDb | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const localStateStr = typeof window !== 'undefined' ? localStorage.getItem('agent_db_state') : null;
      const localState = localStateStr ? JSON.parse(localStateStr) : null;

      let res;
      if (localState) {
        res = await fetch('/api/agent/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ state: localState })
        });
      } else {
        res = await fetch('/api/agent/status');
      }

      if (res.ok) {
        const json = await res.json() as AgentDb;
        setData(json);
        if (typeof window !== 'undefined') {
          localStorage.setItem('agent_db_state', JSON.stringify(json));
        }
      } else {
        setError("Failed to fetch agent status");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const localStateStr = localStorage.getItem('agent_db_state');
      if (localStateStr) {
        try {
          const parsed = JSON.parse(localStateStr) as AgentDb;
          setData(parsed);
          setLoading(false);
        } catch (e) {
          console.error("Error parsing localStorage state", e);
        }
      }
    }
    fetchStatus();
  }, [fetchStatus]);

  const initialize = useCallback(async (name: string, domain: string) => {
    setLoading(true);
    try {
      const localStateStr = typeof window !== 'undefined' ? localStorage.getItem('agent_db_state') : null;
      const localState = localStateStr ? JSON.parse(localStateStr) : null;

      const res = await fetch('/api/agent/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: localState, persona: { name, domain } })
      });
      if (res.ok) {
        const json = await res.json();
        const updatedDb = json.state || json;
        setData(updatedDb);
        if (typeof window !== 'undefined') {
          localStorage.setItem('agent_db_state', JSON.stringify(updatedDb));
        }
        return json;
      } else {
        const errJson = await res.json();
        throw new Error(errJson.error || "Initialization failed");
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, []);

  const triggerCycle = useCallback(async () => {
    setLoading(true);
    try {
      const localStateStr = typeof window !== 'undefined' ? localStorage.getItem('agent_db_state') : null;
      const localState = localStateStr ? JSON.parse(localStateStr) : null;

      const res = await fetch('/api/agent/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: localState, action: 'trigger_cycle' })
      });
      if (res.ok) {
        const json = await res.json() as AgentDb;
        setData(json);
        if (typeof window !== 'undefined') {
          localStorage.setItem('agent_db_state', JSON.stringify(json));
        }
      } else {
        throw new Error("Trigger cycle failed");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSettings = useCallback(async (settings: Partial<AgentDb['persona']> & { sources?: any[] }) => {
    setLoading(true);
    try {
      const localStateStr = typeof window !== 'undefined' ? localStorage.getItem('agent_db_state') : null;
      const localState = localStateStr ? JSON.parse(localStateStr) : null;

      const res = await fetch('/api/agent/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: localState, settings })
      });
      if (res.ok) {
        const json = await res.json() as AgentDb;
        setData(json);
        if (typeof window !== 'undefined') {
          localStorage.setItem('agent_db_state', JSON.stringify(json));
        }
      } else {
        throw new Error("Save settings failed");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const isTriggeringRef = useRef(false);

  useEffect(() => {
    if (!data || !data.initialized) return;

    const checkAndTrigger = async () => {
      if (isTriggeringRef.current) return;

      let lastTime = 0;
      if (data.lastCycleTime) {
        lastTime = new Date(data.lastCycleTime).getTime();
      } else if (data.posts && data.posts.length > 0) {
        lastTime = new Date(data.posts[0].publishedAt).getTime();
      }

      if (lastTime === 0) return;

      const elapsedMinutes = (Date.now() - lastTime) / (1000 * 60);

      // Map frequency to minutes
      let intervalMinutes = 15; // default/demo frequency
      const freq = data.persona?.frequency;
      if (freq === "2× daily") {
        intervalMinutes = 720;
      } else if (freq === "Daily") {
        intervalMinutes = 1440;
      } else if (freq === "Every 2 days") {
        intervalMinutes = 2880;
      } else if (freq === "Weekly") {
        intervalMinutes = 10080;
      }

      if (elapsedMinutes >= intervalMinutes) {
        console.log(`[Virtual Scheduler] Elapsed time ${elapsedMinutes.toFixed(1)}m >= interval ${intervalMinutes}m. Triggering cycle.`);
        isTriggeringRef.current = true;
        try {
          await triggerCycle();
        } catch (e) {
          console.error("Virtual scheduler cycle run failed:", e);
        } finally {
          isTriggeringRef.current = false;
        }
      }
    };

    const intervalId = setInterval(checkAndTrigger, 60 * 1000);
    return () => clearInterval(intervalId);
  }, [data?.initialized, data?.lastCycleTime, data?.posts?.length, triggerCycle]);

  return {
    data,
    loading,
    error,
    reload: fetchStatus,
    initialize,
    triggerCycle,
    saveSettings
  };
}
