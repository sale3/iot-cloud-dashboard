import styled from "styled-components";

export const ButtonContainer = styled.div`
    display: flex;
    flex-direction: row;
    gap: 8px;
    margin-bottom: 16px;
    margin-top: 20px;
    margin-right: 25px;
    align-items: end;
    justify-content: end;
`;

export const CenteredDiv = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex-grow: 1;
`;

export const SubmitButtonDiv = styled(CenteredDiv)`
    margin-top: 15px;
    margin-bottom: 15px;
`;

export const CreateButtonDiv = styled.div`
    display: flex;
    align-items: end;
    justify-content: end;
    margin-bottom: 10px;
    width: 99%;
`;

export const ErrorText = styled.p`
  color: red;
  text-align: center;
  font-size: 14px;
  margin: 0;
  padding: 0;
`;

export const ColDiv = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  flex-wrap: wrap;
  margin-bottom: 10px;
`;

export const StyledLabel = styled.label`
    color: rgba(0, 0, 0, 0.6);
    font-family: "Roboto", "Helvetica", "Arial", sans-serif;
    font-weight: 400;
    font-size: 1rem;
    line-height: 1.4375em;
    letter-spacing: 0.00938em;
    padding: 0;
    display: block;
    transform-origin: top left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 133%;
    font-size: 12px;
    margin-bottom: 2px;
    margin-top: 4px;
`;