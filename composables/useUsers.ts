import { defineStore } from "pinia";
import { FetchStatus } from "./useFetchStatus";

export enum PrivacySetting {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
  FRIENDS_ONLY = "FRIENDS_ONLY",
  PERSONAL = "PERSONAL",
}

export type User = {
  location: string | null;
  user_id: string;
  username: string;
  display_name: string;
  avatar: string | null;
  pronouns: string | null;
  bio: string;
  privacy: PrivacySetting;
};

export const useUsers = defineStore("users", {
  state: () => ({
    users: new Map<string, FetchStatus<User>>(),
  }),
  getters: {
    getUser(): (username: string) => FetchStatus<User> {
      return (username: string) => {
        return this.users.get(username) || { status: Status.IDLE };
      };
    },
  },
  actions: {
    async fetchUser(username: string) {
      // Mark as loading if we don't have the user yet
      if (!this.users.has(username))
        this.users.set(username, { status: Status.LOADING });

      // Fetch the user
      const user = await $fetch<User>(`/api/user/${username}`);

      // // If we got an error, mark as error
      // if (user.error.value) {
      //   this.users.set(username, { status: Status.ERROR, error: user.error });
      //   return;
      // }

      // Otherwise, mark as success
      this.storeUser(user);
    },
    storeUser(user: User) {
      this.users.set(user.username, { status: Status.SUCCESS, data: user });
    },
    async fetchMe() {
      const user = useSupabaseUser();
      if (!user.value) return;        
      const me = await $fetch<User>("/api/settings");

      this.storeUser(me);
    },
  },
});
