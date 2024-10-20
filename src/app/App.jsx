import '../assets/scss/App.scss'
import { useEffect, useState } from "react"
import { Button, Carousel, Container, Form, Modal, Navbar, Spinner, Table, Pagination } from "react-bootstrap"

const App = () => {
    /** STATE FOR PARSING THE JSON FILE THE FIRST TIME */
    const [locations, setLocations] = useState([])

    /** STATE FOR SEARCH BY NAME AND ADDRESS */
    const [searchQuery, setSearchQuery] = useState("")

    /** STATE FOR SORTING */
    const [sortConfig, setSortConfig] = useState({key: null, direction: 'asc'})

    /** STATE FOR MODAL */
    const [showModal, setShowModal] = useState(false)
    const [selectedPhotos, setSelectedPhotos] = useState([])
    const [currentLocation, setCurrentLocation] = useState("")

    /** STATE FOR FILTER BY FREE ATTRACTIONS */
    const [filterByFreeAttractions, setFilterByFreeAttractions] = useState(false)

    /** STATE FOR FILTER BY TAGS */
    const [filterByTags, setFilterByTags] = useState("")

    /** STATE FOR PAGINATION */
    const [postsPerPage] = useState(10)
    const [currentPage, setCurrentPage] = useState(1)

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

    /** HANDLE SEARCH BY TAGS */
    const handleTagsSearch = (query) => {
        setFilterByTags(query)
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
            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1
            }
        }
        return 0
    })

    /** SET FREE VALUES INTO COLUMN */
    const searchFreeAttractions = (desc) => {
        return desc.toLowerCase().includes('free')
    }

    /** FUNCTION TO DISPLAY SORT ICON */
    const getSortIcon = (key) => {
        if (sortConfig.key !== key) {
            return null
        }
        return sortConfig.direction === 'asc' ? '▲' : '▼'
    }

    /** FUNCTION TO OPEN MODAL */
    const handleShowModal = (photos, location) => {
        setSelectedPhotos(photos)
        setCurrentLocation(location)
        setShowModal(true)
    }

    /** HANDLE FREE ATTRACTIONS FILTER */
    const handleFreeAttractions = () => {
        setFilterByFreeAttractions(!filterByFreeAttractions)
    }

    /** FILTER LOCATIONS BASED ON SEARCH QUERY AND FREE ATTRACTIONS */
    const filteredLocations = sortedLocations.filter(location => {
        const matchesSearchQuery =
            location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            location.address.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesTags = filterByTags
            ? location.tags.some(tag => tag.toLowerCase().includes(filterByTags.toLowerCase()))
            : true

        const matchesFreeAttractions = filterByFreeAttractions
            ? searchFreeAttractions(location.description)
            : true

        return matchesSearchQuery && matchesTags && matchesFreeAttractions
    })

    /**********************************************************************************************************
     *                                  BELOW CODE CODE BASED ON:                                             *
     * - https://medium.com/@techvoot.solutions/how-to-implement-pagination-in-your-react-js-e6b53043c84e     *
     * - https://dev.to/canhamzacode/how-to-implement-pagination-with-reactjs-2b04                            *
     *                                                                                                        *
     **********************************************************************************************************/

    /** CALCULATE INDEX FROM LAST AND FIRST ATTRACTIONS */
    const indexOfLastPost = currentPage * postsPerPage
    const indexOfFirstPost = indexOfLastPost - postsPerPage

    /** SELECT THE CURRENT ATTRACTIONS */
    const currentPosts = filteredLocations.slice(indexOfFirstPost, indexOfLastPost)

    /** GENERATE PAGINATION NUMBERS */
    const handlePagination = (length) => {
        const paginationNumbers = []
        for (let i = 1; i <= Math.ceil(length / postsPerPage); i++) {
            paginationNumbers.push(i)
        }
        return paginationNumbers
    }

    const paginationNumbers = handlePagination(filteredLocations.length)

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

            <div className={"space-around"}>
                <div className={"row"}>
                    <div className={"col-lg-3 col-md-6 col-sm-12 mb-3"}>
                        {/* SEARCH BY NAME AND ADDRESS */}
                        <form>
                            <label htmlFor="searchLocation">Search By Name or Address</label>
                            <input
                                className={"search-field box-shadow-custom w-100"}
                                type="text"
                                placeholder={"Search..."}
                                value={searchQuery}
                                onChange={e => handleSearchChange(e.target.value)}
                            />
                        </form>
                    </div>
                    <div className={"col-lg-3 col-md-6 col-sm-12 mb-3"}>
                        {/* SEARCH BY TAGS */}
                        <form>
                            <label htmlFor="searchTags">Search By Tags</label>
                            <input
                                className={"search-field box-shadow-custom w-100"}
                                type="text"
                                placeholder={"Search Tags..."}
                                value={filterByTags}
                                onChange={e => handleTagsSearch(e.target.value)}
                            />
                        </form>
                    </div>
                    <div className={"col-lg-3 col-md-6 col-sm-12 d-flex align-items-center"}>
                        {/* FILTER BY FREE ATTRACTIONS */}
                        <Form className={"w-100"}>
                            <Form.Check
                                className={"mt-2"}
                                type="switch"
                                id="custom-switch"
                                label="Free activities only"
                                onChange={handleFreeAttractions}
                                checked={filterByFreeAttractions}
                            />
                        </Form>
                    </div>
                </div>
            </div>

            {/* CONTENT TABLE */}
            <div className={"content-custom"}>
                <div>
                    {filteredLocations.length <= 0 && (
                        <Spinner className={"spinner-custom"} animation={"border"} variant={"primary"}/>
                    )}
                    {filteredLocations.length > 0 && (
                        <div id="responsive-table">
                            <Table striped bordered hover responsive>
                                <thead>
                                <tr>
                                    <th className={"sort-row"}
                                        onClick={() => handleSort('id')}>ID {getSortIcon('id')}</th>
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
                                    <th>Free</th>
                                </tr>
                                </thead>
                                <tbody>
                                {currentPosts.map(item => (
                                    <tr key={item.id}>
                                        <td data-title="id">{item.id}</td>
                                        <td data-title="name">{item.name}</td>
                                        <td data-title="latitude">{item.latitude}</td>
                                        <td data-title="longitude">{item.longitude}</td>
                                        <td data-title="address">{item.address}</td>
                                        <td data-title="description">{item.description}</td>
                                        <td data-title="phone-number">{item.phoneNumber ? item.phoneNumber : "N/A"}</td>
                                        <td data-title="images">
                                            {item.photosURLs && item.photosURLs.length > 0 ? (
                                                <Button onClick={() => handleShowModal(item.photosURLs, item.name)}>
                                                    Images
                                                </Button>
                                            ) : ("No Images")}
                                        </td>
                                        <td data-title="tags">
                                            {item.tags && item.tags.length > 0 ? (
                                                item.tags.map((tag, index) => (
                                                    <span
                                                        key={index}>{tag}{index < item.tags.length - 1 ? ', ' : ''}</span>
                                                ))
                                            ) : ("No Tags")}
                                        </td>
                                        <td data-title="rating">{item.rating}</td>
                                        <td data-title="description">{searchFreeAttractions(item.description) ? 'Free' : "No"}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </Table>
                            <Pagination className={"pagination-custom"}>
                                {paginationNumbers.map(number => (
                                    <Pagination.Item key={number} active={number === currentPage}
                                                     onClick={() => setCurrentPage(number)}
                                                     className={number === currentPage ? "active-pagination" : ""}>
                                        {number}
                                    </Pagination.Item>
                                ))}
                            </Pagination>
                        </div>
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
                                    <img className={"d-block w-100 modal-display"} src={pic}
                                         alt={`Slide ${index + 1}`}/>
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
    )
}

export default App
