import {
    Box,
    Button,
    Collapse,
    createTheme,
    CssBaseline, FormControl, IconButton, InputAdornment, InputLabel,
    OutlinedInput,
    Stack,
    Switch,
    TextField,
    ThemeProvider,
    Typography
} from "@mui/material";
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import Visibility from '@mui/icons-material/Visibility';
import {produce} from "immer";
import {PreferenceStorageHandler} from "@/lib/PreferenceStorageHandler.ts";

function App() {
    const preferenceStorageHandler = new PreferenceStorageHandler();
    const [showPassword, setShowPassword] = useState(false);
    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const [editCredential, setEditCredential] = useState(false);
    const [preference, setPreference] = useState({
        autoLogin: false,
        credential: {
            password: "",
            username: ""
        }
    });
    const [tempPreference, setTempPreference] = useState({
        autoLogin: false,
        credential: {
            password: "",
            username: ""
        }
    });
    useEffect(() => {
        preferenceStorageHandler.get().then((data) => {
            if (data) {
                setPreference(data);
            }
        })
    }, [])
    useEffect(() => {
        console.log("preference changed", preference);
        // each time when preference was rendered, we should update tempPreference
        setTempPreference(structuredClone(preference));
    }, [preference]);
    const passwordRef = useRef<HTMLInputElement>(null)


    const saveCredential = () => {
        // save the change to preference
        setPreference(structuredClone(tempPreference))
        setEditCredential(false)
        // save preference to local storage
        preferenceStorageHandler.set(tempPreference)
        setShowPassword(false)
    }

    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = isDark ? darkTheme : lightTheme;
    return <>
        <ThemeProvider theme={theme}>
            <Box
                sx={{
                    minWidth: '250px',
                    minHeight: '50px',
                    margin: '20px 15px 10px 15px'
                }}>
                <CssBaseline/>
                <Stack>
                    <Typography fontSize={'large'}>Better CUNY</Typography>
                    <Stack
                        direction={"row"} justifyContent={'space-between'}>
                        <Typography alignContent={"center"}>Automatically Login</Typography>
                        <Switch
                            checked={preference.autoLogin}
                            onChange={() => {
                                setPreference(prev => {
                                    const next = produce(prev, (draft) => {
                                        draft.autoLogin = !draft.autoLogin
                                    })
                                    preferenceStorageHandler.set(next)
                                    return next
                                })
                            }}
                            aria-label={"auto_login_switch"}/>
                    </Stack>
                    <Collapse in={preference.autoLogin}>
                        <Stack sx={{
                            marginTop: '15px'
                        }}>
                            <TextField
                                disabled={!editCredential}
                                label="username"
                                value={tempPreference.credential.username}
                                onChange={(e) => {
                                    console.log(e.target.value);
                                    setTempPreference(prev => {
                                        const next = produce(prev, draft => {
                                            draft.credential.username = e.target.value;
                                        })
                                        // save preference to local storage
                                        preferenceStorageHandler.set(next)
                                        return next
                                    })
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        passwordRef.current?.focus();
                                    }
                                }}
                                size={'small'}
                                sx={{
                                    marginTop: '2px',
                                    marginBottom: '12px'
                                }}/>
                            <FormControl size={'small'} variant="outlined">
                                <InputLabel
                                    disabled={!editCredential}
                                    htmlFor="outlined-adornment-password"
                                    size={'small'}
                                >password</InputLabel>
                                <OutlinedInput
                                    size={'small'}
                                    disabled={!editCredential}
                                    value={tempPreference.credential.password}
                                    inputRef={passwordRef}
                                    onChange={(e) => {
                                        console.log(e.target.value)
                                        setTempPreference(prev => {
                                            return produce(prev, draft => {
                                                draft.credential.password = e.target.value;
                                            })
                                        })
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") saveCredential();
                                    }}
                                    id="outlined-adornment-password"
                                    type={showPassword ? 'text' : 'password'}
                                    endAdornment={
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label={showPassword ? 'hide the password' : 'display the password'}
                                                onClick={handleClickShowPassword}
                                                edge="end"
                                            >
                                                {editCredential && (showPassword ? <VisibilityOff/> : <Visibility/>)}
                                            </IconButton>
                                        </InputAdornment>
                                    }
                                    label="password"
                                />
                            </FormControl>
                            <Stack direction={'row-reverse'}>
                                {editCredential ? <>
                                        <Button
                                            onClick={saveCredential}
                                            size={'medium'}>SAVE</Button>
                                        <Button
                                            onClick={() => {
                                                // cancel the change to temporary preference
                                                setTempPreference(structuredClone(preference))
                                                setEditCredential(false)
                                                setShowPassword(false)
                                            }}
                                            color={'error'}
                                            size={'small'}>CANCEL</Button>
                                    </> :
                                    <Button
                                        onClick={() => {
                                            setEditCredential(true)
                                        }}
                                        size={'small'}>Edit</Button>
                                }
                            </Stack>
                        </Stack>
                    </Collapse>
                </Stack>
            </Box>
        </ThemeProvider>
    </>
}

const darkTheme = createTheme({
    palette: {
        mode: "dark"
    }
})
const lightTheme = createTheme({
    palette: {
        mode: "light"
    }
})
export default App;
