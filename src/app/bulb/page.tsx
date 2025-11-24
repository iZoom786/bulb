"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase";
import { LightBulbIcon as LightBulbSolid } from "@heroicons/react/24/solid";
import { LightBulbIcon as LightBulbOutline } from "@heroicons/react/24/outline";

type DoorState = "OPEN" | "CLOSED";

export default function BulbPage() {
  const [doorState, setDoorState] = useState<DoorState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createBrowserClient();

    const fetchInitial = async () => {
      const { data, error } = await supabase
        .from("door_control")
        .select("door_state")
        .limit(1)
        .maybeSingle();

      if (error) {
        setError(error.message);
        return;
      }

      if (data && (data as any).door_state) {
        setDoorState((data as any).door_state as DoorState);
      }
    };

    const channel = supabase
      .channel("door_control_updates")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "door_control" },
        (payload) => {
          const nextState = (payload.new as any)?.door_state as DoorState | undefined;
          if (nextState) {
            setDoorState(nextState);
          }
        }
      )
      .subscribe();

    fetchInitial();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const isOpen = doorState === "OPEN";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow rounded-lg p-8 text-center">
        <h1 className="text-2xl font-semibold mb-6">Door Status</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>
        )}

        {doorState === null ? (
          <div className="text-gray-500">Loading current state...</div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            {isOpen ? (
              <LightBulbSolid className="h-24 w-24 text-yellow-400" />
            ) : (
              <LightBulbOutline className="h-24 w-24 text-gray-400" />
            )}
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                isOpen ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
              }`}
            >
              {isOpen ? "OPEN" : "CLOSED"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}