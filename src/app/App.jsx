import '../assets/scss/App.scss'
import { useEffect, useState } from "react"
import { Button, Carousel, Container, Modal, Navbar, Spinner, Table } from "react-bootstrap"

const App = () => {
    /** STATE FOR PARSING THE JSON FILE THE FIRST TIME */
    const [locations, setLocations] = useState([])

    /** STATE FOR GETTING THE DATA FROM THE INPUT */
    const [searchQuery, setSearchQuery] = useState("")

    /** STATE FOR SORTING */
    const [sortConfig, setSortConfig] = useState({key: null, direction: 'asc'})

    /** EFFECT TO FETCH AND SET THE DATA FROM JSON TO THE TABLE */
    useEffect(() => {
        fetch('dublin_attractions.json')
            .then(res => res.json())
            .then(data => {
                setLocations(data)
            })
    }, [])

    /** HANDLE SEARCH QUERY */
    const handleSearchChange = (query) => {
        setSearchQuery(query)
    }

    /** HANDLE SORTING */
    const handleSort = (key) => {
        let direction = 'asc'
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc'
        }
        setSortConfig({key, direction})
    }

    /** SORTED LOCATIONS */
    const sortedLocations = [...locations].sort((a, b) => {
        if (sortConfig.key) {
            const aValue = a[sortConfig.key] || ''
            const bValue = b[sortConfig.key] || ''
            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
    })

    /** FILTER THE LOCATIONS */
    const filteredLocations = sortedLocations.filter(location =>
        location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.address.toLowerCase().includes(searchQuery.toLowerCase())
    )

    /** FUNCTION TO DISPLAY SORT ICON */
    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return null
        return sortConfig.direction === 'asc' ? '▲' : '▼'
    }

    /** MODAL */
    const [showModal, setShowModal] = useState(false)
    const [selectedPhotos, setSelectedPhotos] = useState([])
    const [currentLocation, setCurrentLocation] = useState("")

    /** FUNCTION TO OPEN MODAL */
    const handleShowModal = (photos, location) => {
        // console.log(photos)
        setSelectedPhotos(photos)
        setCurrentLocation(location)
        setShowModal(true)
    }

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
                                <th className={"sort-row"} onClick={() => handleSort('id')}>ID {getSortIcon('id')}</th>
                                <th className={"sort-row"}
                                    onClick={() => handleSort('name')}>Name {getSortIcon('name')}</th>
                                <th>Latitude</th>
                                <th>Longitude</th>
                                <th>Address</th>
                                <th>Description</th>
                                <th>Phone Number</th>
                                <th>Images</th>
                                <th>Tags</th>
                                <th className={"sort-row"}
                                    onClick={() => handleSort('rating')}>Rating {getSortIcon('rating')}</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredLocations.map(item => (
                                <tr key={item.id}>
                                    <td>{item.id}</td>
                                    <td>{item.name}</td>
                                    <td>{item.latitude}</td>
                                    <td>{item.longitude}</td>
                                    <td>{item.address}</td>
                                    <td>{item.description}</td>
                                    <td>{item.phoneNumber ? item.phoneNumber : "N/A"}</td>
                                    <td>
                                        {item.photosURLs && item.photosURLs.length > 0 ? (
                                            <Button onClick={() => handleShowModal(item.photosURLs, item.name)}>
                                                Images
                                            </Button>
                                        ) : ("No Images")}
                                    </td>
                                    <td>
                                        {item.tags && item.tags.length > 0 ? (
                                            item.tags.map((tag, index) => (
                                                <span key={index}>{tag}{index < item.tags.length - 1 ? ', ' : ''}</span>
                                            ))
                                        ) : ("No Tags")}
                                    </td>
                                    <td>{item.rating}</td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                    )}
                </div>

                {/* MODAL */}
                <Modal show={showModal} onHide={() => setShowModal(false)} size={"lg"} centered>
                    <Modal.Header closeButton>
                        <Modal.Title className={"modal-title"}>{currentLocation}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Carousel>
                            {selectedPhotos.map((pic, index) => (
                                <Carousel.Item key={index}>
                                    <img
                                        className={"d-block w-100 modal-display"}
                                        src={pic}
                                        alt={`Slide ${index + 1}`}
                                    />
                                </Carousel.Item>
                            ))}
                        </Carousel>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
                    </Modal.Footer>
                </Modal>
            </div>
            <footer className={"page-footer"}>
                <h3>JOSE HENRIQUE PINTO JOANONI® - 2024/2025</h3>
            </footer>
        </>
    );
}

export default App
