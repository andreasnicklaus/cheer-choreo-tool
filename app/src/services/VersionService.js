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
  isVersionNew(versionTag) {
    const versionData = VERSIONS.find((v) => v.tag == versionTag);
    if (!versionData) return false;

    if (versionData.start && Date.now() < versionData.start) return false;
    if (versionData.end && Date.now() > versionData.end) return false;

    return true;
  }
}

export default new VersionService();
