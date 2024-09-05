import React, { useEffect, useState } from "react";
import axios from "axios";
import ConfigCard from "../components/ConfigCard";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import "../style/config-page.css";
import conf from "../conf.json";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import AddIcon from '@mui/icons-material/Add';
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material";

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export const ConfigPage = () => {
    const navigate = useNavigate();
    const theme = useTheme();

    const [tempConfig, setTempConfig] = useState({});
    const [loadConfig, setLoadConfig] = useState({});
    const [fuelConfig, setFuelConfig] = useState({});
    const [snackbar, setSnackbar] = useState(false);

    const [protocols, setProtocols] = useState([]);
    const [initialProtocols, setInitialProtocols] = useState([]);
    const [dataChanged, setDataChanged] = useState(false);

    useEffect(() => {
        if (JSON.stringify(protocols) !== JSON.stringify(initialProtocols)) {
            setDataChanged(true);
        } else {
            setDataChanged(false);
        }
    }, [protocols, initialProtocols]);

    const [openDialog, setOpenDialog] = useState(false);
    const handleClickOpenDialog = () => {
        setOpenDialog(true);
    };
    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);
    const onOpenSuccessSnackbar = () => {
        setOpenSuccessSnackbar(true);
    };
    const handleCloseSuccessSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpenSuccessSnackbar(false);
    };

    let gatewayApiUrl = conf.IOTDEVICE1_GATEWAY_API_URL;

    const getGatewayApiUrl = (username) => {
        const regex = new RegExp(`${username}_GATEWAY_API_URL`);
        Object.keys(conf).forEach(key => {
            if (key.match(regex)) {
                return conf[key];
            }
        });

        return conf.IOTDEVICE1_GATEWAY_API_URL;
    };

    const unassignProtocol = (index) => {
        const updatedProtocols = [...protocols];
        updatedProtocols[index] = {
            ...updatedProtocols[index],
            assigned: false
        };
        setProtocols(updatedProtocols);
    };

    const assignProtocol = (index) => {
        const updatedProtocols = [...protocols];
        updatedProtocols[index] = {
            ...updatedProtocols[index],
            assigned: true
        };
        setProtocols(updatedProtocols);
    };

    const submitDeviceProtocols = () => {
        axios
            .post(process.env.REACT_APP_API_URL + `/protocols/protocol_assignment`, protocols, {
                headers: {
                    Authorization: "Bearer " + sessionStorage.getItem("jwt"),
                },
            })
            .then((res) => {
                if (res.data.result) {
                    setInitialProtocols(protocols);
                    const storedProtocols = JSON.parse(localStorage.getItem('protocols')) || [];
                    const assignedProtocolIds = protocols
                        .filter(protocol => protocol.assigned)
                        .map(protocol => protocol.id);
                    const filteredProtocols = storedProtocols.filter(protocol => assignedProtocolIds.includes(protocol.id));
                    localStorage.setItem('protocols', JSON.stringify(filteredProtocols));
                    onOpenSuccessSnackbar();
                } else {
                    console.log("Error in protocols assignment!")
                }

            }).catch(exc => {
                console.log("Error in protocols assignment: " + exc)
            });

    }

    useEffect(() => {
        if (
            !sessionStorage.getItem("jwt") ||
            sessionStorage.getItem("jwt") === "" ||
            !sessionStorage.getItem("device") ||
            sessionStorage.getItem("device") === ""
        )
            navigate("/iot-platform/login");

        axios
            .get(conf.server_url + `/auth/jwt-check`, {
                headers: {
                    Authorization: "Bearer " + sessionStorage.getItem("jwt"),
                },
            })
            .then((res) => {
                console.log("JWT OK");
            })
            .catch((exc) => {
                console.log("ERROR::JWT_NOT_VALID");
                navigate("/iot-platform/login");
            });

        gatewayApiUrl = getGatewayApiUrl(sessionStorage.getItem("device"));

        // Request current configuration
        axios
            .get(gatewayApiUrl, {
                headers: {},
            })
            .then((res) => {
                console.log("Initial data:");
                console.log(res.data);

                setTempConfig(res.data.temp_settings);
                setLoadConfig(res.data.load_settings);
                setFuelConfig(res.data.fuel_settings);
            })
            .catch((exc) => {
                console.log("ERROR::GATEWAY_API::INITIAL_GET");
                console.log(exc);
                setSnackbar(true);
            });

        axios
            .get(process.env.REACT_APP_API_URL + `/protocols`, {
                headers: {
                    Authorization: "Bearer " + sessionStorage.getItem("jwt"),
                },
            })
            .then((res) => {
                setInitialProtocols(res.data);
                setProtocols(res.data);
            }).catch(exc => {
                console.log("Error fetching protocols")
            });
    }, []);

    const allPropertiesSet = () => {
        return Object.hasOwn(tempConfig, 'interval') &&
            Object.hasOwn(tempConfig, 'mode') &&
            Object.hasOwn(loadConfig, 'interval') &&
            Object.hasOwn(loadConfig, 'mode') &&
            Object.hasOwn(fuelConfig, 'level_limit') &&
            Object.hasOwn(fuelConfig, 'mode');
    };

    const submitConfig = () => {
        console.log("Configuration submitted.");
        console.log(tempConfig);
        console.log(loadConfig);
        console.log(fuelConfig);

        if (!allPropertiesSet()) {
            console.log("ERROR: Not all properties are set.");
            setSnackbar(true);
            return;
        }

        axios.post(
            gatewayApiUrl,
            {
                "temp_settings": {
                    "interval": tempConfig.interval,
                    "mode": tempConfig.mode
                },
                "load_settings": {
                    "interval": loadConfig.interval,
                    "mode": loadConfig.mode
                },
                "fuel_settings": {
                    "level_limit": fuelConfig.level_limit,
                    "mode": fuelConfig.mode
                }
            }
        ).then((res) => {
            console.log("Configuration accepted");
            navigate("/iot-platform/dashboard");
        }).catch((exc) => {
            console.log("ERROR::GATEWAY_API::POST");
            console.log(exc);
            setSnackbar(true);
        });
    };

    const handleCloseSnackbar = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }

        setSnackbar(false);
    };

    const syncProtocols = async () => {
        const response = await axios.post(
            process.env.REACT_APP_API_URL + `/protocols/sync`,
            {},
            {
                headers: {
                    Authorization: "Bearer " + sessionStorage.getItem("jwt")
                }
            }
        );
        if(response.data.result) {
            onOpenSuccessSnackbar();
        }
    }

    return (
        <div>
            <Snackbar
                open={snackbar}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity="error"
                    sx={{ width: "100%" }}
                >
                    Gateway configuration endpoint can't be reached.
                </Alert>
            </Snackbar>
            <Snackbar
                open={openSuccessSnackbar}
                autoHideDuration={1500}
                onClose={handleCloseSuccessSnackbar}
            >
                <Alert
                    onClose={handleCloseSuccessSnackbar}
                    severity="success"
                    sx={{ width: "100%" }}
                >
                    Successful operation!
                </Alert>
            </Snackbar>
            <div className="buttons">
                <Button
                    variant="outlined"
                    color="primary"
                    className=""
                    onClick={() => navigate('/iot-platform/dashboard')}
                >
                    Dashboard
                </Button>
                <Button
                    variant="outlined"
                    color="primary"
                    className=""
                    onClick={() => navigate('/iot-platform/protocol')}
                >
                    Protocols
                </Button>
                <Button
                    variant="outlined"
                    color="primary"
                    className=""
                    onClick={submitConfig}
                >
                    Submit
                </Button>
            </div>

            <div className="col-div">
                <div class="config-options">
                    <ConfigCard
                        title="Temperature"
                        value={tempConfig.interval || ''}
                        min={conf.TEMP_MIN}
                        max={conf.TEMP_MAX}
                        mode={tempConfig.mode || ''}
                        config={tempConfig}
                        setConfig={setTempConfig}
                        marks
                    ></ConfigCard>
                    <ConfigCard
                        title="Load"
                        value={loadConfig.interval || ''}
                        min={conf.LOAD_MIN}
                        max={conf.LOAD_MAX}
                        mode={loadConfig.mode || ''}
                        config={loadConfig}
                        setConfig={setLoadConfig}
                        marks
                    ></ConfigCard>
                    <ConfigCard
                        title="Fuel"
                        value={fuelConfig.level_limit || ''}
                        min={conf.FUEL_MIN}
                        max={conf.FUEL_MAX}
                        mode={fuelConfig.mode || ''}
                        config={fuelConfig}
                        setConfig={setFuelConfig}
                        marks
                    ></ConfigCard>
                </div>

                <Card sx={{ boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)', borderRadius: '15px' }} className="card-custom">
                    <CardContent>
                        <Typography className="title" variant="h5" component="div">
                            Device protocols
                        </Typography>
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 305, 
                                right: 1320,
                            }}
                        >
                            <Button variant="outlined" color="primary" onClick={() => syncProtocols()}>
                                SYNC
                            </Button>
                        </Box>
                        <Button onClick={handleClickOpenDialog}>Assign device protocols</Button>
                        <div className="col-div">

                            {protocols.map((protocol, index) => (protocol.assigned &&
                                <div className="row-div">
                                    <div className="text-div">{protocol.name}</div>
                                    <div className="button-div"><Button
                                        onClick={() => unassignProtocol(index)}
                                        sx={{
                                            fontSize: '12px',
                                        }}
                                        variant="outlined"
                                        color="error"
                                    >
                                        REMOVE
                                    </Button></div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                    <Button variant="outlined"
                        color="primary" sx={{
                            padding: '12px 24px',
                            fontSize: '1.25rem',
                            minWidth: '140px',
                            marginBottom: '15px'
                        }}
                        onClick={() => submitDeviceProtocols()}
                        disabled={!dataChanged}>SUBMIT</Button>
                </Card>

                <Dialog
                    open={openDialog}
                    onClose={handleCloseDialog}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                        {"Unassigned device protocols"}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                                {protocols.map((protocol, index) => (
                                    !protocol.assigned && <ListItem
                                        key={index}
                                        disableGutters
                                        secondaryAction={
                                            <IconButton onClick={() => assignProtocol(index)} sx={{
                                                color: theme.palette.primary.light,
                                                '& .MuiSvgIcon-root': {
                                                    fontSize: 20,
                                                },
                                            }}>
                                                <AddIcon />
                                            </IconButton>
                                        }
                                    >
                                        <ListItemText primary={`${protocol.name}`} />
                                    </ListItem>
                                ))}
                            </List>
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Button onClick={handleCloseDialog} autoFocus>
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </div>
    );
};

export default ConfigPage;
