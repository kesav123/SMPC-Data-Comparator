import React, { useState, useEffect, useMemo } from 'react';
import { Search, RefreshCw, AlertCircle, CheckCircle2, X, Eye } from 'lucide-react';

const PharmaDataComparator = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);

  const [authNumberFilter, setAuthNumberFilter] = useState('');

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://smpcapi.azurewebsites.net/api/getsmpcdata');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setData(Array.isArray(result) ? result : [result]);
      } catch (err) {
        setError(err.message);
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter data based on search terms
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const nameMatch = item.S1_Name_of_Medicinal_product?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      const authMatch = authNumberFilter === '' || 
        item.s_8_authorisation_number?.toLowerCase().includes(authNumberFilter.toLowerCase()) || false;
      
      return nameMatch && (authNumberFilter === '' || authMatch);
    });
  }, [data, searchTerm, authNumberFilter]);

  // Handle item selection
  const handleItemSelect = (item) => {
    if (selectedItems.find(selected => selected.id === item.id)) {
      setSelectedItems(selectedItems.filter(selected => selected.id !== item.id));
    } else if (selectedItems.length < 2) {
      setSelectedItems([...selectedItems, item]);
    } else {
      // Replace the first selected item if already 2 selected
      setSelectedItems([selectedItems[1], item]);
    }
  };

  // Clear selections
  const clearSelections = () => {
    setSelectedItems([]);
  };

  // Get all fields for comparison
  const getAllFields = () => {
    if (selectedItems.length === 0) return [];
    
    const fields = new Set();
    selectedItems.forEach(item => {
      Object.keys(item).forEach(key => fields.add(key));
    });
    
    return Array.from(fields).sort();
  };

  // Check if field values are different
  const areFieldsDifferent = (field) => {
    if (selectedItems.length !== 2) return false;
    return selectedItems[0][field] !== selectedItems[1][field];
  };

  // Format field value for display
  const formatFieldValue = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return String(value);
  };

  // Get field display name
  const getFieldDisplayName = (field) => {
    const fieldMappings = {
      'id': 'ID',
      'country': 'Country',
      'S1_Name_of_Medicinal_product': 'Medicinal Product Name',
      'S2_Composition': 'Composition',
      'S2_Composition_cleaned': 'Composition (Cleaned)',
      'S3_pharmaceutical_form': 'Pharmaceutical Form',
      'S_4_1_therapeutic_indications': 'Therapeutic Indications',
      'S_4_2_posology_administration': 'Posology & Administration',
      'S_4_3_contraindications': 'Contraindications',
      'S_4_4_warnings_precautions': 'Warnings & Precautions',
      'S_4_5_interactions': 'Drug Interactions',
      'S_4_6_pregnancy_lactation': 'Pregnancy & Lactation',
      'S_4_7_driving_machines': 'Effects on Driving & Machines',
      'S_4_8_undesirable_effects': 'Undesirable Effects',
      'S_4_9_overdose': 'Overdose',
      'S_5_1_pharmacodynamics': 'Pharmacodynamics',
      'S_5_2_pharmacokinetics': 'Pharmacokinetics',
      'S_5_3_preclinical_data': 'Preclinical Safety Data',
      'S_6_1_excipients': 'List of Excipients',
      'S_6_2_incompatibilities': 'Incompatibilities',
      'S_6_3_shelf_life': 'Shelf Life',
      'S_6_4_storage': 'Storage Conditions',
      'S_6_5_container_description': 'Container Description',
      'S_6_6_handling_disposal': 'Special Precautions for Disposal',
      'S_7_marketing_authorisation_holder': 'Marketing Authorisation Holder',
      's_8_authorisation_number': 'Marketing Authorisation Number',
      'S_9_authorisation_date': 'Date of First Authorisation',
      'S_10_revision_date': 'Date of Revision',
      'last_updated': 'Last Updated',
      'Source_file_name': 'Source File Name',
      'last_updated_by': 'Last Updated By'
    };

    return fieldMappings[field] || field.replace(/^S\d*_?/, '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingContent}>
          <RefreshCw style={styles.spinner} />
          <span style={styles.loadingText}>Loading pharmaceutical data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorContent}>
          <div style={styles.errorHeader}>
            <AlertCircle style={styles.errorIcon} />
            <span style={styles.errorTitle}>Error Loading Data</span>
          </div>
          <p style={styles.errorMessage}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>SMPC Data Comparator</h1>
          <p style={styles.subtitle}>Compare medicinal product information and specifications</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div style={styles.mainContent}>
        <div style={styles.searchSection}>
          <div style={styles.searchContainer}>
            {/* Search */}
            <div style={styles.searchInputContainer}>
              <div style={styles.searchInputWrapper}>
                <Search style={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search by medicinal product name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={styles.searchInput}
                />
              </div>
            </div>

            {/* Authorization Number Filter */}
            <div style={styles.filterContainer}>
              <input
                type="text"
                placeholder="Filter by auth number..."
                value={authNumberFilter}
                onChange={(e) => setAuthNumberFilter(e.target.value)}
                style={styles.filterInput}
              />
            </div>

            {/* Clear Selections */}
            {selectedItems.length > 0 && (
              <button
                onClick={clearSelections}
                style={styles.clearButton}
              >
                <X style={styles.clearIcon} />
                <span>Clear ({selectedItems.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div style={styles.tableContainer}>
          <div style={styles.tableHeader}>
            <h2 style={styles.tableTitle}>
              Medicinal Products ({filteredData.length})
            </h2>
            <p style={styles.tableSubtitle}>
              Select up to 2 items to compare. Currently selected: {selectedItems.length}/2
            </p>
          </div>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead style={styles.thead}>
                <tr>
                  <th style={styles.th}>Product Name</th>
                  <th style={styles.th}>Authorization Number</th>
                  <th style={styles.th}>Pharmaceutical Form</th>
                  <th style={styles.th}>Active Ingredients</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => {
                  const isSelected = selectedItems.find(selected => selected.id === item.id);
                  const composition = item.S2_Composition || item.S2_Composition_cleaned || 'N/A';
                  
                  return (
                    <tr 
                      key={item.id || index}
                      style={{
                        ...styles.tr,
                        ...(isSelected ? styles.selectedRow : {})
                      }}
                    >
                      <td style={styles.td}>
                        <div style={styles.productName}>
                          {item.S1_Name_of_Medicinal_product || 'N/A'}
                        </div>
                      </td>
                      <td style={styles.td}>
                        {item.s_8_authorisation_number || 'N/A'}
                      </td>
                      <td style={styles.td}>
                        {item.S3_pharmaceutical_form || 'N/A'}
                      </td>
                      <td style={styles.td}>
                        <div style={styles.composition}>
                          {composition}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <button
                          onClick={() => handleItemSelect(item)}
                          disabled={selectedItems.length >= 2 && !isSelected}
                          style={{
                            ...styles.selectButton,
                            ...(isSelected ? styles.selectedButton : {}),
                            ...(selectedItems.length >= 2 && !isSelected ? styles.disabledButton : {})
                          }}
                        >
                          {isSelected ? (
                            <>
                              <CheckCircle2 style={styles.buttonIcon} />
                              <span>Selected</span>
                            </>
                          ) : (
                            <>
                              <Eye style={styles.buttonIcon} />
                              <span>Select</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredData.length === 0 && (
            <div style={styles.noDataContainer}>
              <AlertCircle style={styles.noDataIcon} />
              <p style={styles.noDataText}>No data found matching your criteria</p>
            </div>
          )}
        </div>

        {/* Comparison View */}
        {selectedItems.length > 0 && (
          <div style={styles.comparisonContainer}>
            <div style={styles.comparisonHeader}>
              <h2 style={styles.comparisonTitle}>
                Comparison View ({selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''})
              </h2>
            </div>

            <div style={styles.comparisonContent}>
              {selectedItems.length === 1 ? (
                <div style={styles.singleItemMessage}>
                  <p>Select another item to compare</p>
                </div>
              ) : (
                <div style={styles.comparisonTableWrapper}>
                  <table style={styles.comparisonTable}>
                    <thead>
                      <tr style={styles.comparisonTr}>
                        <th style={styles.comparisonTh}>Field</th>
                        <th style={styles.comparisonTh}>
                          {selectedItems[0]?.S1_Name_of_Medicinal_product || 'Item 1'}
                        </th>
                        <th style={styles.comparisonTh}>
                          {selectedItems[1]?.S1_Name_of_Medicinal_product || 'Item 2'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {getAllFields().map((field) => {
                        const isDifferent = areFieldsDifferent(field);
                        const value1 = selectedItems[0][field];
                        const value2 = selectedItems[1][field];

                        return (
                          <tr 
                            key={field} 
                            style={{
                              ...styles.comparisonDataTr,
                              ...(isDifferent ? styles.differentRow : {})
                            }}
                          >
                            <td style={styles.comparisonFieldTd}>
                              <div style={styles.fieldNameContainer}>
                                <span>{getFieldDisplayName(field)}</span>
                                {isDifferent && (
                                  <AlertCircle style={styles.differenceIcon} />
                                )}
                              </div>
                            </td>
                            <td style={{
                              ...styles.comparisonValueTd,
                              ...(isDifferent ? styles.differentValue1 : {})
                            }}>
                              <div style={styles.valueContainer}>
                                {formatFieldValue(value1)}
                              </div>
                            </td>
                            <td style={{
                              ...styles.comparisonValueTd,
                              ...(isDifferent ? styles.differentValue2 : {})
                            }}>
                              <div style={styles.valueContainer}>
                                {formatFieldValue(value2)}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  spinner: {
    animation: 'spin 1s linear infinite',
    height: '32px',
    width: '32px',
    color: '#2563eb',
  },
  loadingText: {
    fontSize: '18px',
    fontWeight: '500',
    color: '#374151',
  },
  errorContainer: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContent: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '24px',
    maxWidth: '400px',
  },
  errorHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#991b1b',
    marginBottom: '8px',
  },
  errorIcon: {
    height: '20px',
    width: '20px',
  },
  errorTitle: {
    fontWeight: '600',
  },
  errorMessage: {
    color: '#b91c1c',
    margin: 0,
  },
  header: {
    backgroundColor: 'white',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    borderBottom: '1px solid #e5e7eb',
  },
  headerContent: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '16px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#111827',
    margin: 0,
  },
  subtitle: {
    color: '#6b7280',
    marginTop: '4px',
    margin: '4px 0 0 0',
  },
  mainContent: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '24px 16px',
  },
  searchSection: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    border: '1px solid #d1d5db',
    padding: '16px',
    marginBottom: '24px',
  },
  searchContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  searchInputContainer: {
    flex: 1,
  },
  searchInputWrapper: {
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    height: '16px',
    width: '16px',
    color: '#9ca3af',
  },
  searchInput: {
    width: '100%',
    paddingLeft: '40px',
    paddingRight: '16px',
    paddingTop: '8px',
    paddingBottom: '8px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s',
    boxSizing: 'border-box',
  },
  filterContainer: {
    width: '100%',
  },
  filterInput: {
    width: '100%',
    padding: '8px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s',
    boxSizing: 'border-box',
  },
  clearButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    color: '#dc2626',
    border: '1px solid #fca5a5',
    borderRadius: '8px',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontSize: '14px',
  },
  clearIcon: {
    height: '16px',
    width: '16px',
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    border: '1px solid #d1d5db',
  },
  tableHeader: {
    padding: '12px 16px',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb',
  },
  tableTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  tableSubtitle: {
    fontSize: '14px',
    color: '#6b7280',
    marginTop: '4px',
    margin: '4px 0 0 0',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  thead: {
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #e5e7eb',
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '500',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  tr: {
    borderBottom: '1px solid #e5e7eb',
    transition: 'background-color 0.2s',
  },
  selectedRow: {
    backgroundColor: '#eff6ff',
    borderLeft: '4px solid #3b82f6',
  },
  td: {
    padding: '12px 16px',
    color: '#374151',
  },
  productName: {
    fontWeight: '500',
    color: '#111827',
  },
  composition: {
    maxWidth: '400px',
    wordWrap: 'break-word',
    whiteSpace: 'normal',
    lineHeight: '1.4',
  },
  selectButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 12px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
    cursor: 'pointer',
    border: 'none',
    backgroundColor: '#f3f4f6',
    color: '#374151',
  },
  selectedButton: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    border: '1px solid #93c5fd',
  },
  disabledButton: {
    backgroundColor: '#f3f4f6',
    color: '#9ca3af',
    cursor: 'not-allowed',
  },
  buttonIcon: {
    height: '16px',
    width: '16px',
  },
  noDataContainer: {
    textAlign: 'center',
    padding: '48px',
  },
  noDataIcon: {
    height: '48px',
    width: '48px',
    color: '#9ca3af',
    margin: '0 auto 16px',
  },
  noDataText: {
    color: '#6b7280',
    margin: 0,
  },
  comparisonContainer: {
    marginTop: '32px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    border: '1px solid #d1d5db',
  },
  comparisonHeader: {
    padding: '12px 16px',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb',
  },
  comparisonTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  comparisonContent: {
    padding: '16px',
  },
  singleItemMessage: {
    textAlign: 'center',
    padding: '32px',
    color: '#6b7280',
  },
  comparisonTableWrapper: {
    overflowX: 'auto',
  },
  comparisonTable: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  comparisonTr: {
    borderBottom: '1px solid #e5e7eb',
  },
  comparisonTh: {
    padding: '12px 16px',
    textAlign: 'left',
    fontWeight: '500',
    color: '#111827',
  },
  comparisonDataTr: {
    borderBottom: '1px solid #e5e7eb',
  },
  differentRow: {
    backgroundColor: '#fefce8',
  },
  comparisonFieldTd: {
    padding: '12px 16px',
    fontWeight: '500',
    color: '#111827',
    borderRight: '1px solid #e5e7eb',
    width: '25%',
  },
  fieldNameContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  differenceIcon: {
    height: '16px',
    width: '16px',
    color: '#d97706',
  },
  comparisonValueTd: {
    padding: '12px 16px',
    color: '#374151',
    width: '37.5%',
    verticalAlign: 'top',
    maxWidth: '0',
    overflow: 'visible',
  },
  differentValue1: {
    backgroundColor: '#fee2e2',
    color: '#7f1d1d',
  },
  differentValue2: {
    backgroundColor: '#dcfce7',
    color: '#14532d',
  },
  valueContainer: {
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
    lineHeight: '1.5',
    maxWidth: '100%',
  },
};

// Add CSS animation for spinner
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @media (min-width: 768px) {
    .search-container {
      flex-direction: row !important;
    }
    .filter-container {
      width: 256px !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default PharmaDataComparator;