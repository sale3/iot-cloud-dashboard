import React, { useEffect, useState } from "react"
import axios from "axios";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Accordion from '@mui/material/Accordion';
import { Checkbox } from "@mui/material";
import { Typography } from "@mui/material";
import { FormControlLabel } from "@mui/material";
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SocketJS from "sockjs-client";
import { over } from "stompjs";
import { DataGrid } from '@mui/x-data-grid';
import LogoutButton from "../components/LogoutButton";
import { RowDiv, BiggerDiv, SmallerDiv } from "../styled-components/StyledComponents";

export const StatsPage = () => {
    const navigate = useNavigate();
    const [protocols, setProtocols] = useState([]);
    const [selectedProtocols, setSelectedProtocols] = useState([]);
    const [selectedProtocolData, setSelectedProtocolData] = useState({});
    const [stats, setStats] = useState([]);

    useEffect(() => {

        if (
            !sessionStorage.getItem("jwt") ||
            sessionStorage.getItem("jwt") === "" ||
            !sessionStorage.getItem("device") ||
            sessionStorage.getItem("device") === ""
        )
            navigate("/iot-platform/login");

        axios
            .get(process.env.REACT_APP_API_URL + `/protocols`, {
                headers: {
                    Authorization: "Bearer " + sessionStorage.getItem("jwt"),
                },
            })
            .then((res) => {
                const filteredProtocols = res.data.map(protocol => ({
                    ...protocol,
                    protocolData: protocol.protocolData.filter(data => data.mode === "OUTPUT"),
                }));
                setProtocols(filteredProtocols);
                connect();
            }).catch(exc => {
                console.log("Error fetching protocols")
            });
    }, []);


    const formatDate = (dateString) => {
        // Parse the input date string
        const [datePart, timePart] = dateString.split(' ');
        const [year, month, day] = datePart.split('.');

        // Create a Date object
        const dateObj = new Date(`${year}-${month}-${day}T${timePart}`);

        // Format the date to "DD.MM.YYYY HH:mm:ss"
        const dayFormatted = String(dateObj.getDate()).padStart(2, '0');
        const monthFormatted = String(dateObj.getMonth() + 1).padStart(2, '0');
        const yearFormatted = dateObj.getFullYear();
        const timeFormatted = dateObj.toTimeString().split(' ')[0];

        return `${dayFormatted}.${monthFormatted}.${yearFormatted} ${timeFormatted}`;
    };

    const transformData = (data) => {
        const valueWithUnit = `${data.protocolStats.value} ${data.protocolStats.unit}`;
        const formattedDate = formatDate(data.protocolStats.time);
        return {
            ...data.protocolStats,
            protocolName: data.protocolName,
            protocolDataName: data.protocolDataName,
            valueWithUnit: valueWithUnit,
            formattedDate: formattedDate
        };
    };

    const onConnectionEstablished = (stompClient) => {
        setTimeout(() => {
            stompClient.subscribe(
                "/devices/" + sessionStorage.getItem("device") + "/protocol",
                (payload) => {
                    console.log("Received smth!!!")
                    const bodyUnparsed = JSON.parse(payload.body);
                    const body = transformData(bodyUnparsed);
                    setStats((prevStats) => {
                        const isDuplicate = prevStats.some(stat =>
                            stat.time === body.time &&
                            stat.value === body.value &&
                            stat.canId === body.canId &&
                            stat.numBits === body.numBits &&
                            stat.startBit === body.startBit
                        );

                        return isDuplicate ? prevStats : [...prevStats, body];
                    });
                }
            );
        }, 100);
    };

    const connect = () => {
        const socket = new SocketJS(process.env.REACT_APP_API_URL + "/ws");
        const stompClient = over(socket);
        stompClient.connect(
            {},
            () => onConnectionEstablished(stompClient),
            onError
        );
    };

    const onError = () => {
        console.log("Error connecting to Socket JS!");
    };

    const handleProtocolCheckboxChange = (protocolIndex) => (event) => {
        const isChecked = event.target.checked;

        setSelectedProtocols((prevSelectedProtocols) => {
            const newSelectedProtocols = isChecked
                ? [...prevSelectedProtocols, protocolIndex]
                : prevSelectedProtocols.filter(index => index !== protocolIndex);

            const associatedData = protocols[protocolIndex].protocolData.map((_, dataIndex) => dataIndex);
            setSelectedProtocolData((prevSelectedProtocolData) => {
                const newSelectedProtocolData = isChecked
                    ? { ...prevSelectedProtocolData, [protocolIndex]: associatedData }
                    : { ...prevSelectedProtocolData, [protocolIndex]: prevSelectedProtocolData[protocolIndex]?.filter(index => !associatedData.includes(index)) };

                return newSelectedProtocolData;
            });

            return newSelectedProtocols;
        });
    };

    const handleDataCheckboxChange = (protocolIndex, dataIndex) => (event) => {
        const isChecked = event.target.checked;

        setSelectedProtocolData((prevSelectedProtocolData) => {
            const newSelectedProtocolData = {
                ...prevSelectedProtocolData,
                [protocolIndex]: isChecked
                    ? [...(prevSelectedProtocolData[protocolIndex] || []), dataIndex]
                    : (prevSelectedProtocolData[protocolIndex] || []).filter(index => index !== dataIndex)
            };

            setSelectedProtocols((prevSelectedProtocols) => {
                const allDataChecked = protocols[protocolIndex].protocolData.every((_, i) => newSelectedProtocolData[protocolIndex]?.includes(i));
                return allDataChecked
                    ? [...prevSelectedProtocols, protocolIndex]
                    : prevSelectedProtocols.filter(index => index !== protocolIndex);
            });

            return newSelectedProtocolData;
        });
    };

    const protocolColumns = [
        { field: 'protocolDataName', headerName: 'Name', width: 420 },
        { field: 'valueWithUnit', headerName: 'Value', width: 420 },
        { field: 'formattedDate', headerName: 'Time', width: 420 },
    ];

    const addUniqueIdsToRows = (rows) => {
        return rows.map((row, index) => ({
            ...row,
            id: row.id || index,
        }));
    };


    const displaySelectedData = () => {
        return protocols.map((protocol, protocolIndex) => {
            const selectedData = (selectedProtocolData[protocolIndex] || []).map(dataIndex => protocol.protocolData[dataIndex]);
            const selectedDataNames = selectedData.map(data => data.name);
            const filteredStats = stats.filter(stat => {
                return stat.protocolName.trim().toLowerCase() === protocol.name.trim().toLowerCase() &&
                    selectedDataNames.map(name => name.trim().toLowerCase()).includes(stat.protocolDataName.trim().toLowerCase());
            });

            if (selectedProtocols.includes(protocolIndex) || filteredStats.length > 0) {
                if (filteredStats.length > 0) {
                    const rowsWithIds = addUniqueIdsToRows(filteredStats);
                    return (
                        <div key={protocolIndex} style={{ marginBottom: '50px' }}>
                            <Typography
                                variant="h4"
                                style={{ textAlign: 'center', width: '100%', marginBottom: '5px' }}
                            >
                                {protocol.name}
                            </Typography>
                            <div style={{ height: 300, width: 1280 }}>
                                <DataGrid
                                    rows={rowsWithIds}
                                    columns={protocolColumns}
                                    initialState={{
                                        pagination: {
                                            paginationModel: { page: 0, pageSize: 5 },
                                        },
                                        sorting: {
                                            sortModel: [{ field: 'formattedDate', sort: 'desc' }],
                                        },
                                    }}
                                    pageSizeOptions={[5, 10]}
                                    sx={{ overflow: 'clip' }} // sx prop is for MUI components
                                />
                            </div>
                        </div>
                    );
                } else {
                    return (
                        <Typography
                            key={protocolIndex} // Ensure each Typography element has a unique key
                            variant="h4"
                            style={{ textAlign: 'center', width: '100%', marginBottom: '50px' }}
                        >
                            No data for {protocol.name}
                        </Typography>
                    );
                }
            }
            return null; // Ensure a fallback return value
        });
    };


    return (<div>
        <div className="buttons">
            <Button
                variant="outlined"
                color="primary"
                className=""
                onClick={() => navigate('/iot-platform/config')}
            >
                Configuration
            </Button>
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
                onClick={() => navigate('/iot-platform/send_data')}
            >
                Send data
            </Button>
            <LogoutButton />
        </div>
        <RowDiv>
            <BiggerDiv>
                {displaySelectedData()}
            </BiggerDiv>
            <SmallerDiv>
                {protocols.map((protocol, protocolIndex) => (
                    (protocol.assigned && <Accordion key={protocolIndex}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls={`panel${protocolIndex}-content`}
                            id={`panel${protocolIndex}-header`}
                        >
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={selectedProtocols.includes(protocolIndex)}
                                        onChange={handleProtocolCheckboxChange(protocolIndex)}
                                    />
                                }
                                label={<Typography variant="body1">{protocol.name}</Typography>}
                            />
                        </AccordionSummary>


                        {protocol.protocolData.map((data, dataIndex) => (
                            <AccordionDetails key={dataIndex}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={(selectedProtocolData[protocolIndex] || []).includes(dataIndex)}
                                            onChange={handleDataCheckboxChange(protocolIndex, dataIndex)}
                                        />
                                    }
                                    label={<Typography variant="body2">{data.name}</Typography>}
                                />
                            </AccordionDetails>
                        ))}
                    </Accordion>)

                ))}

            </SmallerDiv>
        </RowDiv>

    </div>);
}