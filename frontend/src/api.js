import axios from "axios";
import { LocalStorageKeys } from "./common/constants";

axios.defaults.baseURL =
  window.location.protocol + "//" + window.location.hostname + ":8000/api/v1/";

// intercept 401 errors, and attempt to get new access token, otherwise redirect to signin
function set401Interceptor(on401) {
  axios.interceptors.response.use(null, (error) => {
    if (
      error.response &&
      error.response.status === 401 &&
      error.config &&
      error.response.data.code === "token_not_valid" &&
      error.response.data.messages
    ) {
      return Auth.refresh(localStorage.getItem(LocalStorageKeys.REFRESH))
        .then((refreshResponse) => {
          const access = refreshResponse.data.access;
          const config = {
            ...error.config,
            headers: { ...error.headers, Authorization: "Bearer " + access },
          };
          setAccess(access);
          return axios.request(config);
        })
        .catch(() => {
          on401();
          return Promise.reject(error);
        });
    } else {
      return Promise.reject(error);
    }
  });
}

const setAccess = (access) => {
  if (access != null) {
    axios.defaults.headers.common["Authorization"] = "Bearer " + access;
    localStorage.setItem(LocalStorageKeys.ACCESS, access);
  } else {
    delete axios.defaults.headers.common["Authorization"];
    localStorage.removeItem(LocalStorageKeys.ACCESS);
  }
};

const Auth = {
  login: ({ email, password }) => {
    return axios.post("/auth/login", {
      username: email,
      password,
    });
  },
  // needs email, password, firstName, lastName, postcode, birthYear
  register: function ({
    email,
    password,
    firstName,
    lastName,
    postcode,
    birthYear,
  }) {
    return axios.post("/auth/register", arguments[0]);
  },
  refresh: (refresh) => {
    return axios.post("/auth/refresh", { refresh });
  },
};

const Participants = {
  currentUser: () => {
    return axios.get("participants/current-user");
  },
};

const SupportItems = {
  get: ({
    birthYear,
    postcode,
    supportCategoryID,
    registrationGroupID = null,
  }) => {
    return axios.get(
      `/support-items?birth-year=${birthYear}&postcode=${postcode}&support-category-id=${supportCategoryID}&registration-groupid=${registrationGroupID}`
    );
  },
};

const SupportItemGroups = {
  get: ({
    // todo: involve the following in the filter
    // birthYear,
    // postcode,
    supportCategoryID,
    registrationGroupID = null,
  }) => {
    return axios.get(
      `/support-item-groups?support-category-id=${supportCategoryID}&registration-groupid=${registrationGroupID}`
    );
  },
};

const SupportGroups = {
  all: () => {
    return axios.get("/support-groups");
  },
};

const Plans = {
  list: () => {
    return axios.get("/plans");
  },
  create: ({ startDate, endDate, supportCategories }) => {
    return axios.post("/plans", { startDate, endDate, supportCategories });
  },
  update: (planId, { startDate, endDate, planCategories }) => {
    return axios.patch(`/plans/${planId}`, {
      startDate,
      endDate,
      planCategories,
    });
  },
};

const PlanItems = {
  list: (planCategoryId) => {
    return axios.get(`/plan-categories/${planCategoryId}/plan-items`);
  },
  create: (
    planCategoryId,
    { supportItemGroup, quantity, priceActual, name, frequencyPerYear }
  ) => {
    return axios.post(`/plan-categories/${planCategoryId}/plan-items`, {
      supportItemGroup,
      quantity,
      priceActual,
      name,
      frequencyPerYear,
    });
  },
  delete: (planItemId) => {
    return axios.delete(`/plan-items/${planItemId}`);
  },
  update: (planItemId, { quantity, priceActual, name, frequencyPerYear }) => {
    return axios.patch(`/plan-items/${planItemId}`, {
      quantity,
      priceActual,
      name,
      frequencyPerYear,
    });
  },
};

const RegistrationGroups = {
  list: () => {
    return axios.get("/registration-groups");
  },
};

export default {
  Auth,
  Participants,
  SupportGroups,
  SupportItems,
  SupportItemGroups,
  Plans,
  PlanItems,
  RegistrationGroups,
  setAccess,
  set401Interceptor,
};
