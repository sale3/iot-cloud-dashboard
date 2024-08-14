import * as React from 'react';
import TextField from '@mui/material/TextField';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useForm } from "react-hook-form";
import { protocolSchema } from '../schemas/ProtocolValidation.jsx';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import { ErrorText } from '../styled-components/StyledComponents.jsx';

export default function ProtocolForm(props) {
    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        reset,
        setValue,
        getValues,
    } = useForm({
        mode: "onChange",
        resolver: yupResolver(protocolSchema),
    });

    const onSubmit = () => {
        const data = getValues();
        props.onAction(data);
        props.handleClose();
        reset();
    }

    React.useEffect(() => {
        const defaultValues = {
            name: ""
        };

        setValue("name", props.name !== undefined ? props.name : defaultValues.name);
    }, [props]);

    return (
        <>
            <Dialog
                open={props.open}
                onClose={() => props.handleClose}
                fullWidth
                maxWidth="sm"
            >
                <DialogContent>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <TextField
                            autoFocus
                            required
                            margin="dense"
                            id="name"
                            name="name"
                            label="Protocol Name"
                            type="text"
                            fullWidth
                            variant="standard"
                            {...register("name")}
                        />
                        <ErrorText>{errors.name?.message}</ErrorText>
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