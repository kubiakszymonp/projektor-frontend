import { styled } from '@mui/system';
import Box from '@mui/material/Box';

const StyledBox = styled(Box)(({ theme }) => ({
    color: 'white',
    backgroundColor: '#06090a',
    height: '100%',
    minHeight: '100vh',
    paddingTop: theme.spacing(1),  // default padding
    paddingBottom: theme.spacing(1),  // default padding
    paddingLeft: theme.spacing(1),  // default padding
    paddingRight: theme.spacing(1),  // default padding

    [theme.breakpoints.up('md')]: {
        paddingTop: theme.spacing(3),
        paddingBottom: theme.spacing(3),
        paddingLeft: theme.spacing(5),
        paddingRight: theme.spacing(5),
    },
}));

export default StyledBox;