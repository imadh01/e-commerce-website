import { useState, useEffect, useMemo } from "react";
import { fetchLocationMaster } from "../api/locationApi";

export function useLocationMaster() {
  const [locations, setLocations] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLocationMaster()
      .then(setLocations)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  // Each filter function returns options based on parent selection
  function getCountries() {
    return locations?.countries || [];
  }

  function getStates(countryId) {
    if (!countryId) return [];
    return (locations?.states || []).filter(
      (s) => String(s.country_id) === String(countryId),
    );
  }

  function getDistricts(stateId) {
    if (!stateId) return [];
    return (locations?.districts || []).filter(
      (d) => String(d.state_id) === String(stateId),
    );
  }

  function getTaluks(districtId) {
    if (!districtId) return [];
    return (locations?.taluks || []).filter(
      (t) => String(t.district_id) === String(districtId),
    );
  }

  function getLocalities(talukId) {
    if (!talukId) return [];
    return (locations?.localities || []).filter(
      (l) => String(l.taluk_id) === String(talukId),
    );
  }

  // Find IDs from names (for pre-filling saved addresses)
  function findIdByName(list, name) {
    if (!list || !name) return null;
    const item = list.find((i) => i.name.toLowerCase() === name.toLowerCase());
    return item?.id || null;
  }

  function getAllLocalities() {
    return locations?.localities || [];
  }
  function findParents(localityId) {
    const locality = (locations?.localities || []).find(
      (l) => String(l.id) === String(localityId),
    );
    if (!locality) return null;

    const taluk = (locations?.taluks || []).find(
      (t) => String(t.id) === String(locality.taluk_id),
    );
    const district = taluk
      ? (locations?.districts || []).find(
          (d) => String(d.id) === String(taluk.district_id),
        )
      : null;
    const state = district
      ? (locations?.states || []).find(
          (s) => String(s.id) === String(district.state_id),
        )
      : null;
    const country = state
      ? (locations?.countries || []).find(
          (c) => String(c.id) === String(state.country_id),
        )
      : null;
    return {
      locality,
      taluk,
      district,
      state,
      country,
      postalCode: locality.postal_code || "",
    };
  }
  // Find locality ID from name (for pre-filling edit forms)
  function findLocalityByName(name) {
    if (!name) return null;
    return (locations?.localities || []).find(
      (l) => l.name.toLowerCase() === name.toLowerCase(),
    );
  }
  return {
    isLoading,
    locations,
    getCountries,
    getStates,
    getDistricts,
    getTaluks,
    getLocalities,
    findIdByName,
    getAllLocalities,
    findParents,
    findLocalityByName,
  };
}
