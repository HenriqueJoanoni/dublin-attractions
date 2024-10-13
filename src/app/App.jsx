import '../assets/scss/App.scss'
import { useEffect, useState } from "react";
import { Container, Navbar, Spinner, Table } from "react-bootstrap";

const App = () => {
    /** STATE FOR PARSING THE JSON FILE THE FIRST TIME */
    const [locations, setLocations] = useState([]);

    /** STATE FOR GETTING THE DATA FROM THE INPUT */
    const [searchQuery, setSearchQuery] = useState("")

    /** EFFECT TO FETCH AND SET THE DATA FROM JSON TO THE TABLE */
    useEffect(() => {
        fetch('walk-dublin-poi-details-sample-datap20130415-1449.json')
            .then(res => res.json())
            .then(data => {
                setLocations(data)
            })
    }, [])

    /** HANDLE SEARCH QUERY */
    const handleSearchChange = (query) => {
        setSearchQuery(query)
    }

    /** FILTER THE LOCATIONS AND SET INTO THE TABLE COMPONENT */
    const filteredLocations = locations.filter(location =>
        location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.address.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <>
            {/* NAVBAR */}
            <Navbar className={"navbar-background box-shadow-custom"}>
                <Container>
                    <Navbar.Brand href="#home">
                        <div className={"d-flex justify-content-between"}>
                            <div className={"header-logo"}>
                                <img src="/src/assets/img/destination.png" width={"60"} height={"60"}
                                     alt="destination logo"/>
                            </div>
                            <div className={"navbar-text-custom ms-3"}>Dublin Locations Project</div>
                        </div>
                    </Navbar.Brand>
                </Container>
            </Navbar>

            {/* SEARCH BAR */}
            <div className={"space-around"}>
                <form>
                    <label htmlFor="searchLocation">Search By Name or Address</label>
                    <input
                        className={"search-field box-shadow-custom"}
                        type="text"
                        placeholder={"Search..."}
                        value={searchQuery}
                        onChange={e => handleSearchChange(e.target.value)}
                    />
                </form>
            </div>

            {/* CONTENT TABLE */}
            <div className={"content-custom"}>
                <div>
                    {filteredLocations.length <= 0 && (
                        <Spinner className={"spinner-custom"} animation={"border"} variant={"primary"}/>
                    )}
                    {filteredLocations.length > 0 && (
                        <Table striped bordered hover responsive>
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Address</th>
                                <th>Contact Number</th>
                                <th>Description</th>
                                <th>Image File Name</th>
                                <th>Last Update</th>
                                <th>Latitude</th>
                                <th>Longitude</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredLocations.map(item => (
                                <tr key={item.poiID}>
                                    <td>{item.poiID}</td>
                                    <td>{item.name.trim()}</td>
                                    <td>{item.address.trim()}</td>
                                    <td>{item.contactNumber.trim() ? item.contactNumber.trim() : "N/A"}</td>
                                    <td>{item.description.trim()}</td>
                                    <td>{item.imageFileName.trim()}</td>
                                    <td>{item.lastUpdate.trim()}</td>
                                    <td>{item.latitude}</td>
                                    <td>{item.longitude}</td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                    )}
                </div>
            </div>
            <footer className={"page-footer"}>
                <h3>JOSE HENRIQUE PINTO JOANONI® - 2024/2025</h3>
            </footer>
        </>
    )
}

export default App
