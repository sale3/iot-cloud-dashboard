import * as React from 'react';
import TextField from '@mui/material/TextField';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import { useForm } from "react-hook-form";
import { protocolDataSchema } from '../schemas/ProtocolDataValidation';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import { ErrorText, ColDiv, StyledLabel } from '../styled-components/StyledComponents';

export default function ProtocolDataForm(props) {

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        reset,
        setValue,
        getValues
    } = useForm({
        mode: "onChange",
        resolver: yupResolver(protocolDataSchema),
    });

    const onSubmit = () => {
        const data = getValues();
        if(props.name !== undefined) {
            props.onUpdate(data);
        } else {
            props.onCreate(data);
        }
        props.handleClose();
        reset();
    }

    const [aggregationMethod, setAggregationMethod] = React.useState('');
    const handleAggregationMethodChange = (event) => {
        setAggregationMethod(event.target.value);
    };

    const [mode, setMode] = React.useState('');
    const handleModeChange = (event) => {
        setMode(event.target.value);
    };

    React.useEffect(() => {
        const defaultValues = {
            name: "",
            canId: 0,
            startBit: 0,
            numBits: 0,
            transmitInterval: 0,
            multiplier: 1,
            divisor: 1,
            offset: 0,
            aggregationMethod: "",
            mode: "",
            unit: ""
        };

        if (props.aggregationMethod !== undefined) {
            setAggregationMethod(props.aggregationMethod);
            setValue("aggregationMethod", props.aggregationMethod);
        } else {
            setValue("aggregationMethod", defaultValues.aggregationMethod);
        }
        if (props.mode !== undefined) {
            setMode(props.mode);
            setValue("mode", props.mode);
        } else {
            setValue("mode", defaultValues.mode);
        }

        setValue("name", props.name !== undefined ? props.name : defaultValues.name);
        setValue("canId", props.canId !== undefined ? props.canId : defaultValues.canId);
        setValue("startBit", props.startBit !== undefined ? props.startBit : defaultValues.startBit);
        setValue("numBits", props.numBits !== undefined ? props.numBits : defaultValues.numBits);
        setValue("transmitInterval", props.transmitInterval !== undefined ? props.transmitInterval : defaultValues.transmitInterval);
        setValue("multiplier", props.multiplier !== undefined ? props.multiplier : defaultValues.multiplier);
        setValue("divisor", props.divisor !== undefined ? props.divisor : defaultValues.divisor);
        setValue("offsetValue", props.offset !== undefined ? props.offset : defaultValues.offset);
        setValue("unit", props.unit !== undefined ? props.unit : defaultValues.unit);
    }, [props]);

    return (
        <>
            <Dialog
                open={props.open}
                onClose={() => props.handleClose}
                fullWidth
                maxWidth="sm"
            >

                {/*<DialogTitle>{props.headerText}</DialogTitle>*/}
                <DialogContent>
                    <DialogContentText>
                        All fields are required!
                    </DialogContentText>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <TextField
                            autoFocus
                            required
                            margin="dense"
                            id="name"
                            name="name"
                            label="Name"
                            type="text"
                            fullWidth
                            variant="standard"
                            {...register("name")}
                        />
                        <ErrorText>{errors.name?.message}</ErrorText>
                        <TextField
                            autoFocus
                            required
                            margin="dense"
                            id="canId"
                            name="canId"
                            label="CAN ID"
                            type="number"
                            fullWidth
                            variant="standard"
                            inputProps={{
                                min: 1
                            }}
                            {...register("canId")}
                        />
                        <ErrorText>{errors.canId?.message}</ErrorText>
                        <TextField
                            autoFocus
                            required
                            margin="dense"
                            id="startBit"
                            name="startBit"
                            label="Start bit"
                            type="number"
                            fullWidth
                            variant="standard"
                            inputProps={{
                                min: 0
                            }}
                            {...register("startBit")}
                        />
                        <ErrorText>{errors.startBit?.message}</ErrorText>
                        <TextField
                            autoFocus
                            required
                            margin="dense"
                            id="numBits"
                            name="numBits"
                            label="Number of bits"
                            type="number"
                            fullWidth
                            variant="standard"
                            inputProps={{
                                min: 1
                            }}
                            {...register("numBits")}
                        />
                        <ErrorText>{errors.numBits?.message}</ErrorText>
                        <TextField
                            autoFocus
                            required
                            margin="dense"
                            id="transmitInterval"
                            name="transmitInterval"
                            label="Transmit interval"
                            type="number"
                            fullWidth
                            variant="standard"
                            inputProps={{
                                min: 1
                            }}
                            {...register("transmitInterval")}
                        />
                        <ErrorText>{errors.transmitInterval?.message}</ErrorText>

                        <ColDiv>
                            <StyledLabel>Aggregation method *</StyledLabel>
                            <select onChange={handleAggregationMethodChange} {...register("aggregationMethod")} name="aggregationMethod">
                                <option value="MIN">Min</option>
                                <option value="MAX">Max</option>
                                <option value="AVG">Avg</option>
                                <option value="SUM">Sum</option>
                            </select>
                            <ErrorText>{errors.aggregationMethod?.message}</ErrorText>
                        </ColDiv>


                        <ColDiv>
                            <StyledLabel>Mode *</StyledLabel>
                            <select onChange={handleModeChange} {...register("mode")} name="mode">
                                <option value="INPUT">Input</option>
                                <option value="OUTPUT">Output</option>
                            </select>
                            <ErrorText>{errors.mode?.message}</ErrorText>
                        </ColDiv>
                        <TextField
                            autoFocus
                            required
                            margin="dense"
                            id="multiplier"
                            name="multiplier"
                            label="Multiplier"
                            type="number"
                            fullWidth
                            variant="standard"
                            inputProps={{
                                min: 1
                            }}
                            {...register("multiplier")}
                        />
                        <ErrorText>{errors.multiplier?.message}</ErrorText>
                        <TextField
                            autoFocus
                            required
                            margin="dense"
                            id="divisor"
                            name="divisor"
                            label="Divisor"
                            type="number"
                            fullWidth
                            variant="standard"
                            inputProps={{
                                min: 1
                            }}
                            {...register("divisor")}
                        />
                        <ErrorText>{errors.divisor?.message}</ErrorText>
                        <TextField
                            autoFocus
                            required
                            margin="dense"
                            id="offsetValue"
                            name="offsetValue"
                            label="Offset"
                            type="number"
                            fullWidth
                            variant="standard"
                            {...register("offsetValue")}
                        />
                        <ErrorText>{errors.offset?.message}</ErrorText>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="unit"
                            name="unit"
                            label="Unit"
                            type="text"
                            fullWidth
                            variant="standard"
                            {...register("unit")}
                        />
                        <ErrorText>{errors.unit?.message}</ErrorText>
                        <DialogActions>
                            <Button onClick={props.handleClose}>Cancel</Button>
                            <Button type="submit" disabled={!isValid}>Submit</Button>
                        </DialogActions>
                    </form>

                </DialogContent>
            </Dialog>
        </>

    );
}