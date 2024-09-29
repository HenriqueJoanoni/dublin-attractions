import { Container, Navbar } from "react-bootstrap";
import { PageLogo } from "./PageLogo.jsx";

export const PageHeader = () => {
    return (
        <Navbar className={"navbar-background box-shadow-custom"}>
            <Container>
                <Navbar.Brand href="#home">
                    <div className={"d-flex justify-content-between"}>
                        <PageLogo></PageLogo>
                        <div className={"navbar-text-custom ms-3"}>Dublin Locations Project</div>
                    </div>
                </Navbar.Brand>
            </Container>
        </Navbar>
    )
}