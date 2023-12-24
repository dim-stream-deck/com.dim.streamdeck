import { setGlobalSettings } from "@/main";

// check if the service is installed (local service should be fast to respond)
const checkEndpoint = async () => {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 2500);
    const response = await fetch(`http:/localhost:9121`, {
      signal: controller.signal,
    });
    clearTimeout(id);
    return response.status === 200;
  } catch (e) {
    console.log(e);
    return false;
  }
};

export const checkInstalledService = async () => {
  const enabledSoloService = await checkEndpoint();
  await setGlobalSettings({ enabledSoloService });
  return enabledSoloService;
};
