import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "../pages/services/userService";
import { toast } from "sonner";

export const useChangePassword = (logout, navigate) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.changePassword,
    onSuccess: () => {
      toast.success("Password updated successfully!");

      // Clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      localStorage.removeItem("role");

      // Log out user
      if (logout) logout();

      // Redirect to login
      if (navigate) navigate("/signin");

      queryClient.invalidateQueries(["users"]);
    },
    onError: (error) => {
      const message = error.response?.data?.message || "Failed to update password";
      toast.error(message);
    },
  });
};

