import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const CitySearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [limit, setLimit] = useState(5);
  const [warning, setWarning] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async (term = '') => {
    setLoading(true);
    setError('');
    setWarning('');

    try {
      const options = {
        method: 'GET',
        url: `https://${process.env.REACT_APP_API_URL}/v1/geo/cities`,
        params: {
          namePrefix: term,
          limit: limit
        },
        headers: {
          'x-rapidapi-key': process.env.REACT_APP_API_KEY,
          'x-rapidapi-host': process.env.REACT_APP_API_URL
        }
      };

      const response = await axios.request(options);
      const citiesData = response.data.data;

      if (citiesData.length === 0) {
        setError('No result found');
        setCities([]);
      } else {
        setCities(citiesData);
        setError(''); 
      }
    } catch (err) {
      setError('Failed to fetch data');
      setCities([]); 
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (limit > 10) {
      setWarning('You cannot fetch more than 10 items.');
      return;
    }
    fetchCities(searchTerm);
  };

  const handleLimitChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (value > 10) {
      setWarning('Limit cannot exceed 10');
    } else {
      setWarning('');
      setLimit(value);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = cities.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="city-search-container">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search for a city"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      <div className="limit-input">
        <label>
          Results Limit:
          <input
            type="number"
            value={limit}
            min="1"
            max="10"
            onChange={handleLimitChange}
          />
        </label>
        {warning && <p className="warning">{warning}</p>}
      </div>

      {loading ? (
        <div className="spinner">Loading...</div>
      ) : (
        <table className="cities-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Place Name</th>
              <th>Country</th>
            </tr>
          </thead>
          <tbody>
            {error ? (
              <tr>
                <td colSpan="3">{error}</td>
              </tr>
            ) : currentItems.length > 0 ? (
              currentItems.map((city, index) => (
                <tr key={city.id}>
                  <td>{indexOfFirstItem + index + 1}</td>
                  <td>{city.name}</td>
                  <td>
                    {city.country} <img src={`https://flagsapi.com/${city.countryCode}/flat/32.png`} alt={city.country} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">Start searching</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {!error && cities.length > 0 && (
        <div className="pagination">
          {Array.from({ length: Math.ceil(cities.length / itemsPerPage) }, (_, index) => (
            <button
              key={index}
              onClick={() => paginate(index + 1)}
              className={currentPage === index + 1 ? 'active' : ''}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CitySearch;
