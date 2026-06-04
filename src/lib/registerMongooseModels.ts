import mongoose from "mongoose";
import BatchClass from "@/models/BatchClass";
import User from "@/models/User";

/**
 * Registers mongoose models required for RoutineSlot.populate() and similar refs.
 * Keep imports in this file — Next/Turbopack can drop unused model imports from
 * route chunks that only re-export helpers from batchAccess.
 */
export function ensureMongooseModelsRegistered(): void {
  const required = [BatchClass, User] as const;
  for (const model of required) {
    const name = model.modelName;
    if (!mongoose.models[name]) {
      throw new Error(
        `Mongoose model "${name}" is not registered. Check model imports.`,
      );
    }
  }
}
