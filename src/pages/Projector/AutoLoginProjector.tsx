import { useNavigate, useParams } from "react-router-dom";
import { ProjectorPage } from "./Projector";
import { useEffect, useState } from "react";
import { useApi } from "../../services/useApi";
import { AuthApi } from "../../api/generated";
import { jwtPersistance } from "../../services/jwt-persistance";

export const AutoLoginProjectorPage: React.FC<{ isPreview: boolean }> = ({ isPreview }) => {
    const [loggedIn, setLoggedIn] = useState<boolean>(false);
    const { email, password } = useParams();
    const { getApi } = useApi();
    const navigate = useNavigate();

    useEffect(() => {
        getApi(AuthApi).authControllerLogin({
            email: email || "",
            password: password || "",
        }).then((res) => {
            const jwt = res.data;
            jwtPersistance.saveJwt(jwt);
            const decoded = jwtPersistance.getDecodedJwt();
            if (!decoded) return;
            setLoggedIn(true);
            navigate("/projector/" + decoded.organizationId);
        });
    }, []);

    return (
        <>
            {loggedIn && <ProjectorPage isPreview={isPreview} />}
        </>
    );
};
