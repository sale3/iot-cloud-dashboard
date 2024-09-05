import * as React from 'react';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ButtonContainer, CenteredDiv, SubmitButtonDiv, CreateButtonDiv } from '../styled-components/StyledComponents';
import ProtocolForm from '../components/ProtocolForm';
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
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import LogoutButton from '../components/LogoutButton';
import axios from "axios";
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';

function TablePaginationActions(props) {
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

TablePaginationActions.propTypes = {
    count: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
};

export default function ProtocolPage() {
    const navigate = useNavigate();

    React.useEffect(() => {
        if (
            !sessionStorage.getItem("jwt") ||
            sessionStorage.getItem("jwt") === "" ||
            !sessionStorage.getItem("device") ||
            sessionStorage.getItem("device") === ""
        )
            navigate("/iot-platform/login");

        axios.get(process.env.REACT_APP_API_URL + `/protocols`, {
            headers: {
                Authorization: "Bearer " + sessionStorage.getItem("jwt"),
            },
        })
            .then((res) => {
                setProtocolData(res.data);
            })
            .catch((exc) => {
                console.log("Error fetching protocol data!");
            });
    }, []);

    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);

    const [indexToDelete, setIndexToDelete] = React.useState(-1);
    const [deleteOpen, setDeleteOpen] = React.useState(false);
    const handleClickDeleteOpen = (index) => {
        setIndexToDelete(index);
        setDeleteOpen(true);
    };
    const handleDeleteClose = () => {
        setIndexToDelete(-1);
        setDeleteOpen(false);
    };

    const [protocolData, setProtocolData] = React.useState([]);
    const [open, setOpen] = React.useState(false);
    const [currentRow, setCurrentRow] = React.useState({});

    const [searchText, setSearchText] = React.useState('');
    const [filteredData, setFilteredData] = React.useState([]);
    React.useEffect(() => {
        setFilteredData(protocolData);
    }, [protocolData]);
    const handleSearchChange = (event) => {
        setSearchText(event.target.value);
    };
    React.useEffect(() => {
        if (searchText === '') {
            setFilteredData(protocolData);
        } else {
            const lowerCaseSearchText = searchText.toLowerCase();
            setFilteredData(
                protocolData.filter((item) =>
                    item.name.toLowerCase().includes(lowerCaseSearchText)
                )
            );
        }
    }, [searchText, protocolData]);

    const [successSnackbarOpen, setSuccessSnackbarOpen] = React.useState(false);
    const openSuccessSnackbar = () => {
        setSuccessSnackbarOpen(true);
    };
    const handleSuccessSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setSuccessSnackbarOpen(false);
    };

    const [errorSnackbarOpen, setErrorSnackbarOpen] = React.useState(false);
    const openErrorSnackbar = () => {
        setErrorSnackbarOpen(true);
    };
    const handleErrorSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setErrorSnackbarOpen(false);
    };

    const handleClickOpen = (row) => {
        setCurrentRow(row);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const onCreateProtocol = (newProtocol) => {
        const isDuplicate = protocolData.some(item => item.name === newProtocol.name);

        if (isDuplicate) {
            openErrorSnackbar();
        } else {
            setProtocolData([...protocolData, newProtocol]);
            axios.post(process.env.REACT_APP_API_URL + `/protocols`, newProtocol, {
                headers: {
                    Authorization: "Bearer " + sessionStorage.getItem("jwt"),
                },
            })
                .then((res) => {
                    openSuccessSnackbar();

                })
                .catch((exc) => {
                    console.log("Error fetching protocol data!");
                });

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

    const showData = (id) => {
        navigate(`/iot-platform/protocol-data/${id}`);
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
                <h1 style={{ color: '#2196F3' }}>
                    DEVICE PROTOCOLS
                </h1>
                <TextField
                    fullWidth
                    label="Search by protocol name..."
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
                                    <TableCell style={{ width: 160 }} align="right">
                                        <Button variant="outlined" onClick={() => showData(row.id)}>
                                            SHOW/EDIT DATA
                                        </Button>
                                    </TableCell>

                                    <TableCell style={{ width: 160 }} align="right">
                                        <Tooltip title={row.assigned ? "Protocol assigned to the device" : "Protocol not assigned to the device"}>
                                            <span>
                                                <Button
                                                    disabled={row.assigned}
                                                    variant="outlined"
                                                    color='error'
                                                    onClick={() => handleClickDeleteOpen(index)}
                                                >
                                                    DELETE
                                                </Button>
                                            </span>
                                        </Tooltip>
                                        <Dialog
                                            open={deleteOpen}
                                            onClose={handleDeleteClose}
                                            PaperProps={{
                                                component: 'form',
                                                onSubmit: (event) => {
                                                    event.preventDefault();
                                                    if (indexToDelete !== -1) {
                                                        const updatedProtocolData = protocolData.filter((_, index) => index !== indexToDelete);
                                                        const deletedElement = protocolData[indexToDelete];
                                                        setProtocolData(updatedProtocolData);
                                                        axios.delete(process.env.REACT_APP_API_URL + `/protocols/${deletedElement.id}`, {
                                                            headers: {
                                                                Authorization: "Bearer " + sessionStorage.getItem("jwt"),
                                                            },
                                                        })
                                                            .then((res) => {
                                                                if (res.data.result) {
                                                                    openSuccessSnackbar();
                                                                }
                                                            })
                                                            .catch((exc) => {
                                                                console.log("Error fetching protocol data!");
                                                            });
                                                    } else {
                                                        openErrorSnackbar();
                                                    }
                                                    handleDeleteClose();
                                                },
                                            }}
                                        >
                                            <DialogTitle>Delete Protocol</DialogTitle>
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
                                    ActionsComponent={TablePaginationActions}
                                />
                            </TableRow>
                        </TableFooter>
                    </Table>
                </TableContainer>
            </CenteredDiv>
            <ProtocolForm name={currentRow.name} open={open} setOpen={setOpen}
                onAction={onCreateProtocol} handleClose={handleClose} />
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
        </>
    );
}
