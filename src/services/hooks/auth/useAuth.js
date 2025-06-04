export const getStoredUser = () => {
  try {
    const userData = localStorage.getItem("userData");

    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Error parsing stored user data:", error);

    return null;
  }
};

export const getStoredRoles = () => {
  try {
    const roles = localStorage.getItem("userRoles");

    return roles ? JSON.parse(roles) : [];
  } catch (error) {
    console.error("Error parsing stored roles:", error);

    return [];
  }
};

export const getAccessToken = () => {
  return localStorage.getItem("accessToken");
};

export const hasRole = (roleName) => {
  const roles = getStoredRoles();

  return roles.includes(roleName);
};

export const isAuthenticated = () => {
  return !!getAccessToken() || !!localStorage.getItem("oauth_hash");
};

export const logout = () => {
  localStorage.removeItem("accessToken");

  localStorage.removeItem("refreshToken");

  localStorage.removeItem("userData");

  localStorage.removeItem("userRoles");

  localStorage.removeItem("divulgaifToken");

  localStorage.removeItem("divulgaifUser");

  window.location.href = "/login";
};
