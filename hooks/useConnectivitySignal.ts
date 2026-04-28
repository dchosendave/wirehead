import { useCallback, useRef, useState } from 'react';
import type { ConnectivityResult } from '../lib/connectivity';

interface ApplyConnectivityOptions {
  animateAll?: boolean;
}

export function useConnectivitySignal() {
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set());
  const [signalWaveId, setSignalWaveId] = useState(0);
  const [signalDistanceById, setSignalDistanceById] = useState<Record<string, number>>({});
  const [newlyConnectedIds, setNewlyConnectedIds] = useState<Set<string>>(new Set());

  const connectedIdsRef = useRef<Set<string>>(new Set());
  const signalWaveIdRef = useRef(0);

  const applyConnectivity = useCallback(
    (result: ConnectivityResult, options?: ApplyConnectivityOptions) => {
      const animateAll = options?.animateAll === true;
      const previousConnectedIds = connectedIdsRef.current;
      const nextConnectedIds = result.connectedIds;
      const nextNewlyConnectedIds = new Set<string>();

      for (const id of nextConnectedIds) {
        if (animateAll || !previousConnectedIds.has(id)) {
          nextNewlyConnectedIds.add(id);
        }
      }

      if (nextNewlyConnectedIds.size > 0) {
        const powerId = Object.keys(result.distanceById).find(
          (id) => result.distanceById[id] === 0,
        );
        if (powerId) {
          nextNewlyConnectedIds.add(powerId);
        }
      }

      connectedIdsRef.current = nextConnectedIds;
      setConnectedIds(nextConnectedIds);
      setSignalDistanceById(result.distanceById);
      setNewlyConnectedIds(nextNewlyConnectedIds);

      if (animateAll || nextNewlyConnectedIds.size > 0) {
        signalWaveIdRef.current += 1;
        setSignalWaveId(signalWaveIdRef.current);
      }
    },
    [],
  );

  const setConnectivitySnapshot = useCallback((result: ConnectivityResult) => {
    connectedIdsRef.current = result.connectedIds;
    setConnectedIds(result.connectedIds);
    setSignalDistanceById(result.distanceById);
    setNewlyConnectedIds(new Set());
  }, []);

  return {
    connectedIds,
    signalWaveId,
    signalDistanceById,
    newlyConnectedIds,
    applyConnectivity,
    setConnectivitySnapshot,
  };
}
