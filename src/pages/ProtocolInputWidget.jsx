import React, { useState, useEffect } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Checkbox from '@mui/material/Checkbox';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { ButtonContainer } from '../styled-components/StyledComponents';
import LogoutButton from '../components/LogoutButton';
import Snackbar from '@mui/material/Snackbar';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { CenteredDiv } from '../styled-components/StyledComponents';
import Alert from '@mui/material/Alert';

export default function ProtocolInputWidget() {
    const navigate = useNavigate();
    const [protocols, setProtocols] = useState([]);

    const [loaderShow, setLoaderShow] = useState(true);

    const [open, setOpen] = useState(false);
    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const openSnackbar = () => {
        setSnackbarOpen(true);
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    const [rowData, setRowData] = useState({});

    // Handler to update the value of a specific row
    const handleValueChange = (tableIndex, rowIndex, event) => {
        const { value } = event.target;
        setRowData(prevState => ({
            ...prevState,
            [`${tableIndex}-${rowIndex}`]: {
                ...prevState[`${tableIndex}-${rowIndex}`],
                value
            }
        }));
    };

    // Table index is protocol index
    // Row index is protocol data index inside a certain protocol
    const handleSetClick = (tableIndex, rowIndex) => {
        let currentValue = rowData[`${tableIndex}-${rowIndex}`]?.value || '';
        const protocol = protocols[tableIndex];
        const protocolDataItem = protocol.protocolData[rowIndex];
        if (currentValue == "") {
            currentValue = 0;
        }
        const currentValueInt = parseFloat(currentValue);
        const dataToStart = { "type": "can_message", "action": "send", "dataId": protocolDataItem.id, "value": currentValueInt };

        setRowData(prevState => ({
            ...prevState,
            [`${tableIndex}-${rowIndex}`]: {
                ...prevState[`${tableIndex}-${rowIndex}`],
                active: true
            }
        }));

        axios.post(process.env.REACT_APP_API_URL + `/protocol_data/send_data_to_device`, dataToStart, {
            headers: {
                Authorization: "Bearer " + sessionStorage.getItem("jwt"),
            },
        })
            .then((res) => {
                openSnackbar();
            })
            .catch((exc) => {
                console.log("Error fetching protocol data!");
            });
    };

    // Handler for the STOP button
    const handleStopClick = (tableIndex, rowIndex) => {
        const protocol = protocols[tableIndex];
        const protocolDataItem = protocol.protocolData[rowIndex];
        const dataToStop = { "type": "can_message", "action": "stop", "dataId": protocolDataItem.id }

        setRowData(prevState => ({
            ...prevState,
            [`${tableIndex}-${rowIndex}`]: {
                ...prevState[`${tableIndex}-${rowIndex}`],
                active: false
            }
        }));

        axios.post(process.env.REACT_APP_API_URL + `/protocol_data/stop_data_from_device`, dataToStop, {
            headers: {
                Authorization: "Bearer " + sessionStorage.getItem("jwt"),
            },
        })
            .then((res) => {
                openSnackbar();
            })
            .catch((exc) => {
                console.log("Error fetching protocol data!");
            });
    };

    useEffect(() => {
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

        const fetchData = async () => {
            try {
                // Check session storage for required data
                if (
                    !sessionStorage.getItem("jwt") ||
                    sessionStorage.getItem("jwt") === "" ||
                    !sessionStorage.getItem("device") ||
                    sessionStorage.getItem("device") === ""
                ) {
                    navigate("/iot-platform/login");
                    return;
                }

                const protocolsResponse = await axios.get(process.env.REACT_APP_API_URL + `/protocols`, {
                    headers: {
                        Authorization: "Bearer " + sessionStorage.getItem("jwt"),
                    },
                });

                // Second request
                const currentValuesResponse = await axios.get(process.env.REACT_APP_API_URL + `/protocol_data/current_values_request`, {
                    headers: {
                        Authorization: "Bearer " + sessionStorage.getItem("jwt"),
                    },
                });

                // Process the data
                const fetchedProtocols = protocolsResponse.data;
                const filteredProtocols = fetchedProtocols
                    .filter(protocol => protocol.assigned)
                    .map(protocol => {
                        protocol.show = false;

                        const filteredProtocolData = protocol.protocolData
                            .filter(data => data.mode === 'INPUT' && data.assigned == true)
                            .map(data => ({ ...data, show: false }));

                        if (filteredProtocolData.length > 0) {
                            return {
                                ...protocol,
                                protocolData: filteredProtocolData
                            };
                        }
                        return null;
                    })
                    .filter(protocol => protocol !== null);

                const storedProtocols = JSON.parse(localStorage.getItem('protocols')) || [];

                const updatedProtocols = filteredProtocols.map(protocol => {
                    const storedProtocol = storedProtocols.find(stored => stored.id === protocol.id);

                    if (storedProtocol) {
                        const updatedProtocolData = protocol.protocolData.map(data => {
                            const storedData = storedProtocol.protocolData.find(stored => stored.id === data.id);
                            return storedData ? { ...data, show: storedData.show } : data;
                        });

                        return {
                            ...protocol,
                            show: storedProtocol.show,
                            protocolData: updatedProtocolData
                        };
                    }

                    return protocol;
                });

                setProtocols(updatedProtocols);

                // Wait for 2 seconds
                await delay(2000);

                const additionalResponse = await axios.get(process.env.REACT_APP_API_URL + `/protocol_data/current_values`, {
                    headers: {
                        Authorization: "Bearer " + sessionStorage.getItem("jwt"),
                    },
                });

                // Update protocol data with additional response
                const additionalData = additionalResponse.data;

                const updatedProtocolsWithValues = updatedProtocols.map(protocol => {
                    const updatedProtocolData = protocol.protocolData.map(data => {
                        // Find additional data with matching dataId
                        const additionalItem = additionalData.find(item => item.dataId === data.id);

                        if (additionalItem) {
                            return {
                                ...data,
                                value: additionalItem.value,
                                active: true
                            };
                        }
                        return data;
                    });

                    return {
                        ...protocol,
                        protocolData: updatedProtocolData
                    };
                });

                setProtocols(updatedProtocolsWithValues);

                // Also update rowData for table cells if necessary
                const newRowData = {};
                updatedProtocolsWithValues.forEach((protocol, protocolIndex) => {
                    protocol.protocolData.forEach((data, dataIndex) => {
                        const existingRow = rowData[`${protocolIndex}-${dataIndex}`];
                        newRowData[`${protocolIndex}-${dataIndex}`] = {
                            value: data.value || 0,
                            active: existingRow ? existingRow.active : data.active // Retain previous active state if available
                        };
                    });
                });

                setRowData(newRowData);
                setLoaderShow(false);

            } catch (error) {
                console.log("Error: " + error);
            }
        };

        fetchData();
    }, [])

    const handleCheckboxChange = (protocolId, dataId) => {
        setProtocols((prevProtocols) => {
            const updatedProtocols = prevProtocols.map((protocol) => {
                if (protocol.id === protocolId) {
                    const updatedProtocolData = protocol.protocolData.map((data) => {
                        if (data.id === dataId) {
                            return { ...data, show: !data.show };
                        }
                        return data;
                    });

                    const anyDataChecked = updatedProtocolData.some((data) => data.show);

                    return {
                        ...protocol,
                        protocolData: updatedProtocolData,
                        show: anyDataChecked
                    };
                }
                return protocol;
            });

            // Write updated protocols to localStorage
            const filteredProtocols = updatedProtocols.map(protocol => ({
                ...protocol,
                protocolData: protocol.protocolData.filter(data => data.show)
            })).filter(protocol => protocol.protocolData.length > 0);

            // Remove existing entry in localStorage
            localStorage.removeItem('protocols');

            // Save the updated protocols to localStorage
            localStorage.setItem('protocols', JSON.stringify(filteredProtocols));

            return updatedProtocols;
        });
    };

    const removeFromTable = (protocolIndex, dataIndex) => {
        setProtocols((prevProtocols) => {
            const updatedProtocols = prevProtocols.map((protocol, pIndex) => {
                if (pIndex === protocolIndex) {
                    // Update the show property of the specific protocolData entry
                    const updatedProtocolData = protocol.protocolData.map((data, dIndex) => {
                        if (dIndex === dataIndex) {
                            return { ...data, show: false };
                        }
                        return data;
                    });

                    // Check if any data is still shown
                    const anyDataChecked = updatedProtocolData.some((data) => data.show);

                    // Update the protocol show property based on the updated data
                    return {
                        ...protocol,
                        protocolData: updatedProtocolData,
                        show: anyDataChecked
                    };
                }
                return protocol;
            });

            // Write updated protocols to localStorage
            const filteredProtocols = updatedProtocols.map(protocol => ({
                ...protocol,
                protocolData: protocol.protocolData.filter(data => data.show)
            })).filter(protocol => protocol.protocolData.length > 0);

            // Remove existing entry in localStorage
            localStorage.removeItem('protocols');

            // Save the updated protocols to localStorage
            localStorage.setItem('protocols', JSON.stringify(filteredProtocols));

            return updatedProtocols;
        });
    };

    
    return (
        <>
            {loaderShow ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <ButtonContainer>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => navigate('/iot-platform/config')}
                        >
                            Configuration
                        </Button>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => navigate('/iot-platform/dashboard')}
                        >
                            Dashboard
                        </Button>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => navigate('/iot-platform/protocol')}
                        >
                            Protocols
                        </Button>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => navigate('/iot-platform/protocol-stats')}
                        >
                            Stats
                        </Button>
                        <LogoutButton />
                    </ButtonContainer>

                    <Button sx={{ marginLeft: '50px' }} variant="outlined" onClick={handleClickOpen}>
                        Add protocol data for sending
                    </Button>

                    <Dialog
                        maxWidth="xl"
                        open={open}
                        onClose={handleClose}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <DialogTitle id="alert-dialog-title">
                            Input protocol data
                        </DialogTitle>
                        <DialogContent>
                            <TableContainer component={Paper}>
                                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>SHOW</TableCell>
                                            <TableCell align="right">Protocol Name</TableCell>
                                            <TableCell align="right">Protocol Data Name</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {protocols.map((protocol, protocolIndex) =>
                                            protocol.protocolData.map((data, index) => (
                                                <TableRow
                                                    key={`${protocol.id}-${data.id}-${index}`}
                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                >
                                                    <TableCell component="th" scope="row">
                                                        <Checkbox
                                                            disabled={rowData[`${protocolIndex}-${index}`]?.active}
                                                            checked={data.show || false}
                                                            onChange={() => handleCheckboxChange(protocol.id, data.id)}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right">{protocol.name}</TableCell>
                                                    <TableCell align="right">{data.name}</TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClose} autoFocus>
                                Close
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {protocols.map((protocol, protocolIndex) => (
                        protocol.show && (
                            <div key={protocolIndex}>
                                <h3 style={{ textAlign: 'center' }}>{protocol.name}</h3>
                                <TableContainer component={Paper}>
                                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="center" sx={{ width: '20%' }}>Input value</TableCell>
                                                <TableCell align="center" sx={{ width: '20%' }}>Data name</TableCell>
                                                <TableCell align="center" sx={{ width: '20%' }}>SEND TO DEVICE</TableCell>
                                                <TableCell align="center" sx={{ width: '20%' }}>STOP SENDING TO DEVICE</TableCell>
                                                <TableCell align="center" sx={{ width: '20%' }}>REMOVE DATA FROM TABLE</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {protocol.protocolData.map((row, dataIndex) => (
                                                row.show && (
                                                    <TableRow
                                                        key={row.name}
                                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                    >
                                                        <TableCell align="center">
                                                            <CenteredDiv>
                                                                {rowData[`${protocolIndex}-${dataIndex}`]?.active && (
                                                                    <span style={{ color: 'green', marginLeft: '8px' }}>Already set</span>
                                                                )}
                                                                <TextField
                                                                    type="number"
                                                                    id={`value-${protocolIndex}-${dataIndex}`}
                                                                    label="Value"
                                                                    variant="outlined"
                                                                    value={rowData[`${protocolIndex}-${dataIndex}`]?.value === "" ? 0 : rowData[`${protocolIndex}-${dataIndex}`]?.value || 0}
                                                                    onChange={(e) => handleValueChange(protocolIndex, dataIndex, e)}
                                                                    disabled={rowData[`${protocolIndex}-${dataIndex}`]?.active}
                                                                />
                                                            </CenteredDiv>
                                                        </TableCell>
                                                        <TableCell align="center">{row.name}</TableCell>
                                                        <TableCell align="center">
                                                            <Button
                                                                variant="outlined"
                                                                color="primary"
                                                                onClick={() => handleSetClick(protocolIndex, dataIndex)}
                                                                disabled={rowData[`${protocolIndex}-${dataIndex}`]?.active}
                                                            >
                                                                SET
                                                            </Button>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Button
                                                                variant="outlined"
                                                                color="error"
                                                                onClick={() => handleStopClick(protocolIndex, dataIndex)}
                                                                disabled={!rowData[`${protocolIndex}-${dataIndex}`]?.active}
                                                            >
                                                                STOP
                                                            </Button>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Button
                                                                variant="outlined"
                                                                color="error"
                                                                onClick={() => removeFromTable(protocolIndex, dataIndex)}
                                                                disabled={rowData[`${protocolIndex}-${dataIndex}`]?.active}
                                                            >
                                                                REMOVE
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </div>
                        )
                    ))}
                    <Snackbar open={snackbarOpen} autoHideDuration={1000} onClose={handleSnackbarClose}>
                        <Alert
                            onClose={handleSnackbarClose}
                            severity="success"
                            variant="filled"
                            sx={{ width: '100%' }}
                        >
                            Successful operation!
                        </Alert>
                    </Snackbar>
                </>
            )}
        </>
    );

}