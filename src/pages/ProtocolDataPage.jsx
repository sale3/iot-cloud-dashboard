import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableFooter from '@mui/material/TableFooter';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useNavigate } from 'react-router-dom';
import ProtocolDataForm from '../components/ProtocolDataForm';
import { ButtonContainer, CenteredDiv, SubmitButtonDiv, CreateButtonDiv } from '../styled-components/StyledComponents';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import LogoutButton from '../components/LogoutButton';
import { useParams } from 'react-router-dom';
import axios from "axios";
import TextField from '@mui/material/TextField';
import EditIcon from '@mui/icons-material/Edit';
import ProtocolForm from '../components/ProtocolForm';

function ProtocolDataActions(props) {
    const theme = useTheme();
    const { count, page, rowsPerPage, onPageChange } = props;

    const handleFirstPageButtonClick = (event) => {
        onPageChange(event, 0);
    };

    const handleBackButtonClick = (event) => {
        onPageChange(event, page - 1);
    };

    const handleNextButtonClick = (event) => {
        onPageChange(event, page + 1);
    };

    const handleLastPageButtonClick = (event) => {
        onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
    };

    return (
        <Box sx={{ flexShrink: 0, ml: 2.5 }}>
            <IconButton
                onClick={handleFirstPageButtonClick}
                disabled={page === 0}
                aria-label="first page"
            >
                {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
            </IconButton>
            <IconButton
                onClick={handleBackButtonClick}
                disabled={page === 0}
                aria-label="previous page"
            >
                {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
            </IconButton>
            <IconButton
                onClick={handleNextButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="next page"
            >
                {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
            </IconButton>
            <IconButton
                onClick={handleLastPageButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="last page"
            >
                {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
            </IconButton>
        </Box>
    );
}

ProtocolDataActions.propTypes = {
    count: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
};

export default function ProtocolDataPage() {
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        if (
            !sessionStorage.getItem("jwt") ||
            sessionStorage.getItem("jwt") === "" ||
            !sessionStorage.getItem("device") ||
            sessionStorage.getItem("device") === ""
        )
            navigate("/iot-platform/login");

        axios.get(process.env.REACT_APP_API_URL + `/protocol_data/${id}`, {
            headers: {
                Authorization: "Bearer " + sessionStorage.getItem("jwt"),
            },
        })
            .then((res) => {
                setInitialData(res.data);
                setCanData(res.data);
            })
            .catch((exc) => {
                console.log("Error fetching protocol data!");
            });

        axios.get(process.env.REACT_APP_API_URL + `/protocols/${id}`, {
            headers: {
                Authorization: "Bearer " + sessionStorage.getItem("jwt"),
            },
        })
            .then((res) => {
                setInitialProtocolName(res.data.name);
                setProtocol(res.data);
            })
            .catch((exc) => {
                console.log("Error fetching protocol data!");
            });

    }, []);

    const [protocol, setProtocol] = useState({});
    const [initialProtocolName, setInitialProtocolName] = useState('');

    const [canData, setCanData] = useState([]);
    const [initialData, setInitialData] = useState([]);

    const [protocolDialogOpen, setProtocolDialogOpen] = useState(false);
    const handleProtocolDialogClickOpen = () => {
        setProtocolDialogOpen(true);
    };
    const handleProtocolDialogClose = () => {
        setProtocolDialogOpen(false);
    }

    useEffect(() => {
        if (JSON.stringify(canData) === JSON.stringify(initialData) && protocol.name === initialProtocolName) {
            setDataChanged(false);
        } else {
            setDataChanged(true);
        }
    }, [canData, protocol, initialData]);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const [open, setOpen] = useState(false);
    const [currentRow, setCurrentRow] = useState({});
    const [dataChanged, setDataChanged] = useState(false);

    const onCreateCANData = (newData) => {
        const isDuplicate = canData.some(item => item.name === newData.name);
        let bitsOverlap = false;

        const lowerBoundary = parseInt(newData.startBit, 10);
        const upperBoundary = parseInt(newData.startBit, 10) + parseInt(newData.numBits, 10) - 1;

        const currentRowIndex = canData.findIndex(row => row.name === currentRow.name);

        canData.forEach((element, index) => {
            if (element.canId == newData.canId) {
                bitsOverlap = checkDuplicate(lowerBoundary, upperBoundary, element);
            }
        });

        if (isDuplicate) {
            openErrorSnackbar();
        } else if (bitsOverlap) {
            openErrorOverlapSnackbar();
        } else {
            //openSuccessSnackbar();
            setCanData([...canData, newData]);
        }
    }

    const onUpdateCANData = (newData) => {
        const isDuplicate = canData.some(item => item.name === newData.name && currentRow.name !== newData.name);
        const currentRowIndex = canData.findIndex(row => row.name === currentRow.name);
        let bitsOverlap = false;

        const lowerBoundary = parseInt(newData.startBit, 10);
        const upperBoundary = parseInt(newData.startBit, 10) + parseInt(newData.numBits, 10) - 1;

        canData.forEach((element, index) => {
            if (element.canId == newData.canId && index != currentRowIndex) {
                bitsOverlap = checkDuplicate(lowerBoundary, upperBoundary, element);
            }
        });

        if (isDuplicate) {
            openErrorSnackbar();
        } else if (bitsOverlap) {
            openErrorOverlapSnackbar();
        } else {
            const updatedCANData = canData.map(item => {
                const isMatch = item.name === currentRow.name;
                return isMatch ? { ...item, ...newData } : item;
            });
            setCanData(updatedCANData);
            //openSuccessSnackbar();
        }
    }

    const checkDuplicate = (lowerBoundary, upperBoundary, element) => {
        const lowerElementBoundary = parseInt(element.startBit, 10);
        const upperElementBoundary = parseInt(element.startBit, 10) + parseInt(element.numBits, 10) - 1;
        if ((lowerBoundary >= lowerElementBoundary && lowerBoundary <= upperElementBoundary) ||
            (upperBoundary >= lowerElementBoundary && upperBoundary <= upperElementBoundary)) {
            return true;
        }
        return false;
    }

    const handleClickOpen = (row) => {
        setCurrentRow(row);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const [indexToDelete, setIndexToDelete] = useState(-1);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const handleClickDeleteOpen = (index) => {
        setIndexToDelete(index);
        setDeleteOpen(true);
    };
    const handleDeleteClose = () => {
        setIndexToDelete(-1);
        setDeleteOpen(false);
    };

    const [searchText, setSearchText] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    useEffect(() => {
        setFilteredData(canData);
    }, [canData]);
    const handleSearchChange = (event) => {
        setSearchText(event.target.value);
    };
    useEffect(() => {
        if (searchText === '') {
            setFilteredData(canData);
        } else {
            const lowerCaseSearchText = searchText.toLowerCase();
            setFilteredData(
                canData.filter((item) =>
                    item.name.toLowerCase().includes(lowerCaseSearchText)
                )
            );
        }
    }, [searchText, canData]);

    const submitChanges = (event) => {
        event.preventDefault();

        if (dataChanged) {
            canData.forEach((element) => {
                if (element.id === undefined) {
                    element.id = 0;
                }
            });

            const dataToSubmit = { "protocolName": protocol.name, "protocolData": canData };

            axios.post(process.env.REACT_APP_API_URL + `/protocol_data/${id}`, dataToSubmit, {
                headers: {
                    Authorization: "Bearer " + sessionStorage.getItem("jwt"),
                },
            })
                .then((res) => {
                    if (res.data.result) {
                        openSuccessSnackbar();
                        setInitialData(canData);
                    } else {
                        //This case should never happen
                        console.log("Certain error exists!");
                    }
                })
                .catch((exc) => {
                    console.log("Error fetching protocol data!");
                });
        } else {
            //This scenario shouldn't even happen really
            console.log("Data not changed!");
        }
    }

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredData.length) : 0;

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);
    const openSuccessSnackbar = () => {
        setSuccessSnackbarOpen(true);
    };
    const handleSuccessSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setSuccessSnackbarOpen(false);
    };

    const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false);
    const openErrorSnackbar = () => {
        setErrorSnackbarOpen(true);
    };
    const handleErrorSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setErrorSnackbarOpen(false);
    };

    const [errorOverlapSnackbarOpen, setErrorOverlapSnackbarOpen] = useState(false);
    const openErrorOverlapSnackbar = () => {
        setErrorOverlapSnackbarOpen(true);
    };
    const handleErrorOverlapSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setErrorOverlapSnackbarOpen(false);
    };

    const smallTextStyle = {
        fontSize: '0.75rem',
        textAlign: 'right'
    };

    const lightTextStyle = {
        color: '#888',
    }

    const bigTextStyle = {
        fontSize: '1rem',
        fontStyle: 'bold'
    }

    const onUpdateProtocol = (updatedProtocol) => {
        updatedProtocol.id = protocol.id;

        axios.post(process.env.REACT_APP_API_URL + `/protocols/check_name`, updatedProtocol, {
            headers: {
                Authorization: "Bearer " + sessionStorage.getItem("jwt"),
            },
        })
            .then((res) => {
                if (res.data.result) {
                    setProtocol(updatedProtocol);
                } else {
                    openErrorSnackbar();
                }
            })
            .catch((exc) => {
                console.log("Error fetching protocol data!");
            });
    }

    return (
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
                <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => navigate('/iot-platform/send_data')}
                >
                    Widget
                </Button>
                <LogoutButton />
            </ButtonContainer>
            <CenteredDiv>
                <h1 style={{
                    color: '#2196F3',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    textAlign: 'center'
                }}>
                    PROTOCOL DATA <br></br> {protocol.name}
                    <Button style={{ minWidth: 'auto' }} onClick={() => handleProtocolDialogClickOpen()}><EditIcon /></Button>
                    <ProtocolForm name={protocol.name} open={protocolDialogOpen} setOpen={setProtocolDialogOpen}
                        onAction={onUpdateProtocol} handleClose={handleProtocolDialogClose} />
                </h1>

                <TextField
                    fullWidth
                    label="Search by data name..."
                    id="70-width"
                    sx={{
                        width: '70%',
                        mb: 3
                    }}
                    value={searchText}
                    onChange={handleSearchChange}
                />
                <TableContainer component={Paper} sx={{ maxWidth: '70%', width: '100%' }}>
                    <CreateButtonDiv><Button variant="outlined"
                        color="success" onClick={() => handleClickOpen({})}>CREATE</Button></CreateButtonDiv>
                    <Table aria-label="custom pagination table">
                        <TableBody>
                            {(rowsPerPage > 0
                                ? filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                : filteredData
                            ).map((row, index) => (
                                <TableRow key={row.name}>
                                    <TableCell component="th" scope="row">
                                        {row.name}
                                    </TableCell>
                                    <TableCell style={smallTextStyle}>
                                        <span style={lightTextStyle}>MESSAGE ID</span> <span style={bigTextStyle}>{row.canId}</span>
                                    </TableCell>
                                    <TableCell style={smallTextStyle}>
                                        <span style={lightTextStyle}>START BIT</span> <span style={bigTextStyle}>{row.startBit}</span>
                                    </TableCell>
                                    <TableCell style={smallTextStyle}>
                                        <span style={lightTextStyle}>NUMBER OF BITS</span> <span style={bigTextStyle}>{row.numBits}</span>
                                    </TableCell>
                                    <TableCell style={{ width: 160 }} align="right">
                                        <Button variant="outlined" onClick={() => handleClickOpen(row)}>
                                            SHOW/EDIT
                                        </Button>
                                    </TableCell>
                                    <TableCell style={{ width: 160 }} align="right">
                                        <Button variant="outlined" color='error' onClick={() => handleClickDeleteOpen(index)}>
                                            DELETE
                                        </Button>
                                        <Dialog
                                            open={deleteOpen}
                                            onClose={handleDeleteClose}
                                            PaperProps={{
                                                component: 'form',
                                                onSubmit: (event) => {
                                                    event.preventDefault();
                                                    if (indexToDelete !== -1) {
                                                        const updatedCANData = canData.filter((_, index) => index !== indexToDelete);
                                                        setCanData(updatedCANData);
                                                        //openSuccessSnackbar();
                                                    } else {
                                                        openErrorSnackbar();
                                                    }
                                                    handleDeleteClose();
                                                },
                                            }}
                                        >
                                            <DialogTitle>Delete Data From Protocol</DialogTitle>
                                            <DialogContent>
                                                <DialogContentText>
                                                    Are you sure?
                                                </DialogContentText>
                                            </DialogContent>
                                            <DialogActions>
                                                <Button onClick={handleDeleteClose}>Cancel</Button>
                                                <Button type="submit" color="error">Delete</Button>
                                            </DialogActions>
                                        </Dialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {emptyRows > 0 && (
                                <TableRow style={{ height: 53 * emptyRows }}>
                                    <TableCell colSpan={6} />
                                </TableRow>
                            )}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TablePagination
                                    rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                                    colSpan={3}
                                    count={filteredData.length}
                                    rowsPerPage={rowsPerPage}
                                    page={page}
                                    slotProps={{
                                        select: {
                                            inputProps: {
                                                'aria-label': 'rows per page',
                                            },
                                            native: true,
                                        },
                                    }}
                                    onPageChange={handleChangePage}
                                    onRowsPerPageChange={handleChangeRowsPerPage}
                                    ActionsComponent={ProtocolDataActions}
                                />
                            </TableRow>
                        </TableFooter>
                    </Table>
                </TableContainer>
                <SubmitButtonDiv>
                    <Button variant="outlined"
                        color="primary" disabled={!dataChanged} style={{ fontSize: '1.2rem' }} onClick={(event) => submitChanges(event)}><b>Submit Changes</b></Button>
                </SubmitButtonDiv>
            </CenteredDiv>
            <ProtocolDataForm name={currentRow.name} canId={currentRow.canId} startBit={currentRow.startBit} numBits={currentRow.numBits}
                transmitInterval={currentRow.transmitInterval} aggregationMethod={currentRow.aggregationMethod} mode={currentRow.mode}
                multiplier={currentRow.multiplier} divisor={currentRow.divisor} offset={currentRow.offsetValue} unit={currentRow.unit} open={open} setOpen={setOpen}
                onCreate={onCreateCANData} onUpdate={onUpdateCANData} handleClose={handleClose} />
            <Snackbar open={successSnackbarOpen} autoHideDuration={2000} onClose={handleSuccessSnackbarClose}>
                <Alert
                    onClose={handleSuccessSnackbarClose}
                    severity="success"
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    Successful operation!
                </Alert>
            </Snackbar>
            <Snackbar open={errorSnackbarOpen} autoHideDuration={2000} onClose={handleErrorSnackbarClose}>
                <Alert
                    onClose={handleErrorSnackbarClose}
                    severity="error"
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    Name conflict!
                </Alert>
            </Snackbar>
            <Snackbar open={errorOverlapSnackbarOpen} autoHideDuration={2000} onClose={handleErrorOverlapSnackbarClose}>
                <Alert
                    onClose={handleErrorOverlapSnackbarClose}
                    severity="error"
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    Overlap in bits with other data in protocol!
                </Alert>
            </Snackbar>
        </>

    );
}
