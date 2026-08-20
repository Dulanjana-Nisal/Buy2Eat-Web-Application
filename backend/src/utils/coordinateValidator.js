const validateCoordinates = (coordinates) => {
    if (!Array.isArray(coordinates) || (coordinates.length !== 2 && coordinates.length !== 3)) {
        return false;
    }

    const [longitude, latitude, altitude] = coordinates;

    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
        return false;
    }

    if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
        return false;
    }

    return altitude === undefined || Number.isFinite(altitude);
};

module.exports = validateCoordinates;
