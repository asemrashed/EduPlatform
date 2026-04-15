/** Stub for legacy admin table types; no MongoDB in EduPlatform. */
export interface IUser {
  _id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

const User = {};
export default User;
