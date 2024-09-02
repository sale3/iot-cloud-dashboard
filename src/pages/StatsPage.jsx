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