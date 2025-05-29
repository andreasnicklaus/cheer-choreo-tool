import ax from "./RequestService";

const VERSIONS = [
  {
    tag: "0.10.3",
    start: null,
    end: new Date(2025, 6, 15), // July 15th 2025
  },
  {
    tag: "0.11.0",
    start: null,
    end: new Date(2025, 6, 15), // July 15th 2025
  },
];

class VersionService {
  serverVersion = null;

  isVersionNew(versionTag) {
    const versionData = VERSIONS.find((v) => v.tag == versionTag);
    if (!versionData) return false;

    if (versionData.start && Date.now() < versionData.start) return false;
    if (versionData.end && Date.now() > versionData.end) return false;

    return true;
  }

  getAppVersion() {
    return process.env.VUE_APP_VERSION;
  }

  async getServerVersion() {
    if (this.serverVersion) return this.serverVersion;

    return ax
      .get("/version")
      .then((res) => res.data)
      .catch(() => null);
  }
}

export default new VersionService();
