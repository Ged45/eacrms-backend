import { analyticsRepository } from "./analytics.repository";

export const analyticsService = {
  getDashboard() {
    return analyticsRepository.getDashboard();
  },
};
