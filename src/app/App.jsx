import '../assets/scss/App.scss'
import { useEffect, useState } from "react"
import { Button, Carousel, Container, Form, Modal, Navbar, Spinner, Table, Pagination } from "react-bootstrap"

const App = () => {
    /**********************************************************************************************************
     *                                  RESIZE CODE CODE BASED ON:                                            *
     * - https://medium.com/@christian_maehler/handle-window-resizing-with-a-react-context-4392b47285e4       *
     * - https://medium.com/@bomber.marek/how-to-check-for-window-resizing-in-react-6b57d0ed7776              *
     *                                                                                                        *
     **********************************************************************************************************/

    /** EFFECT TO FETCH AND SET THE DATA FROM JSON TO THE TABLE */
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 1080)
        }
        window.addEventListener('resize', handleResize)
        handleResize()

        fetch('dublin_attractions.json')
            .then(res => res.json())
            .then(data => {
                setLocations(data)
            })

        return () => window.removeEventListener('resize', handleResize)
    }, [])

    /**********************************************************************************************************
     *                                  INITIAL STATES                                                        *
     **********************************************************************************************************/

    /** STATE FOR PARSING THE JSON FILE THE FIRST TIME */
    const [locations, setLocations] = useState([])

    /** STATE FOR SEARCH BY NAME AND ADDRESS */
    const [searchQuery, setSearchQuery] = useState("")

    /** STATE FOR SORTING */
    const [sortConfig, setSortConfig] = useState({key: null, direction: 'asc'})

    /** STATE FOR MODAL (PICTURES) */
    const [showModal, setShowModal] = useState(false)
    const [selectedPhotos, setSelectedPhotos] = useState([])
    const [currentLocation, setCurrentLocation] = useState("")

    /** STATE FOR MODAL (FORMS) */
    const [showModalForm, setShowModalForm] = useState(false)
    const [currentForm, setCurrentForm] = useState("")

    /** STATE FOR FILTER BY FREE ATTRACTIONS */
    const [filterByFreeAttractions, setFilterByFreeAttractions] = useState(false)

    /** STATE FOR FILTER BY TAGS */
    const [filterByTags, setFilterByTags] = useState("")

    /** STATE FOR DELETE BUTTON */
    const [deleteAttraction, setDeleteAttraction] = useState([])

    /** STATE FOR UPDATE BUTTON */
    const [updatedAttraction, setUpdatedAttraction] = useState([])
    
    /** STATE FOR FILTER BY RATING */
    const [filterByRating, setFilterByRating] = useState(false)

    /** STATE FOR PAGINATION */
    const [postsPerPage] = useState(10)
    const [currentPage, setCurrentPage] = useState(1)
    const [isMobile, setIsMobile] = useState(false)

    /**********************************************************************************************************
     *                                      HANDLERS                                                          *
     **********************************************************************************************************/

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

    /** FUNCTION TO OPEN MODAL (PICTURES) */
    const handleShowModal = (photos, location) => {
        setSelectedPhotos(photos)
        setCurrentLocation(location)
        setShowModal(true)
    }

    /** FUNCTION TO OPEN MODAL (FORMS) */
    const handleShowModalForms = (formType) => {
        setShowModalForm(true)
        setCurrentForm(formType)
    }

    /** HANDLE FREE ATTRACTIONS FILTER */
    const handleFreeAttractions = () => {
        setFilterByFreeAttractions(!filterByFreeAttractions)
    }

    /** HANDLE RATING FILTER */
    const handleRatingAttractions = () => {
        setFilterByRating(!filterByRating)
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

        const matchesRating = filterByRating ? location.rating > 4.5 : true

        return matchesSearchQuery && matchesTags && matchesFreeAttractions && matchesRating
    })

    /** HANDLE FORM SUBMIT */
    const handleFormSubmit = (newAttractionData) => {
        console.log(newAttractionData)
        const newAttraction = {
            id: newAttractionData.attrId,
            name: newAttractionData.attrName,
            latitude: newAttractionData.attrLatitude,
            longitude: newAttractionData.attrLongitude,
            address: newAttractionData.attrAddress,
            description: newAttractionData.attrDescription,
            phoneNumber: newAttractionData.attrPhoneNumber,
            photosURLs: newAttractionData.attrPhotos ? Array.from(newAttractionData.attrPhotos).map(file => URL.createObjectURL(file)) : [],
            tags: newAttractionData.attrTags ? newAttractionData.attrTags.split(',') : [],
            rating: newAttractionData.attrRating,
            free: newAttractionData.attrFree
        }

        setLocations((prevLocations) => {
            const index = prevLocations.findIndex((item) => item.id === newAttraction.id)
            if (index !== -1) {
                const updatedLocations = [...prevLocations]
                updatedLocations[index] = newAttraction
                return updatedLocations
            } else {
                return [...prevLocations, newAttraction]
            }
        })

        setDeleteAttraction((allLocations) => {
            const index = allLocations.findIndex((item) => item.id === newAttraction.id)
            if (index !== -1) {
                const updatedDeleteAttraction = [...allLocations]
                updatedDeleteAttraction[index] = newAttraction
                return updatedDeleteAttraction
            } else {
                return [...allLocations, newAttraction]
            }
        })
    }

    /** HANDLE DELETE ATTRACTION */
    const handleDeleteElement = (attractionID) => {
        setDeleteAttraction((prevAttractions) =>
            prevAttractions.filter((attraction) => attraction.id !== attractionID)
        )
        setLocations((prevLocations) =>
            prevLocations.filter((location) => location.id !== attractionID)
        )
    }

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
    const currentPosts = isMobile ? filteredLocations : filteredLocations.slice(indexOfFirstPost, indexOfLastPost)

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

                        {/* FILTER BY RATING */}
                        <Form className={"w-100"}>
                            <Form.Check
                                className={"mt-2"}
                                type="switch"
                                id="custom-switch"
                                label="5 star attractions"
                                onChange={handleRatingAttractions}
                                checked={filterByRating}
                            />
                        </Form>
                    </div>
                    <div className={"col-lg-3 col-md-6 col-sm-12 d-flex align-items-center"}>
                        {/* INSERT BUTTON */}
                        <button className={"insert-button"}
                                onClick={() => handleShowModalForms("insert new attraction")}>Insert new
                        </button>
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
                                    <th>Action</th>
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
                                        <td data-title="free-attraction">
                                            {(searchFreeAttractions(item.description) || item.free) ? 'Free' : 'No'}
                                        </td>
                                        <td data-title="action-buttons">
                                            <div className="button-group">
                                                <button
                                                    className="update-button crud-buttons"
                                                    onClick={() => {
                                                        handleShowModalForms("update attraction")
                                                        setUpdatedAttraction(item)
                                                    }}
                                                >
                                                    <img
                                                        src="/src/assets/img/pencil.png"
                                                        width="20"
                                                        height="20"
                                                        alt="pencil icon"
                                                        title="Edit Element"
                                                    />
                                                </button>
                                                <button
                                                    className="delete-button crud-buttons"
                                                    onClick={() => handleDeleteElement(item.id)}
                                                >
                                                    <img
                                                        src="/src/assets/img/recycle-bin.png"
                                                        width="20"
                                                        height="20"
                                                        alt="trash icon"
                                                        title="Delete Element"
                                                    />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </Table>
                            {!isMobile && (
                                <div className="pagination-container">
                                    <Pagination className={"pagination-custom"}>
                                        {paginationNumbers.map(number => (
                                            <Pagination.Item
                                                key={number}
                                                active={number === currentPage}
                                                onClick={() => setCurrentPage(number)}
                                                className={number === currentPage ? 'active-pagination-item' : ''}
                                            >
                                                {number}
                                            </Pagination.Item>
                                        ))}
                                    </Pagination>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* MODAL PICTURES */}
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

                {/* MODAL FORMS */}
                <Modal show={showModalForm} onHide={() => setShowModalForm(false)} size={"xl"} centered>
                    <Modal.Header closeButton>
                        <Modal.Title className={"modal-title"}>{currentForm}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {currentForm.toLowerCase().includes('insert') ?
                            <InsertForm onSubmit={handleFormSubmit}/> :
                            <UpdateForm updatedAttraction={updatedAttraction} onSubmit={handleFormSubmit}/>
                        }
                    </Modal.Body>
                </Modal>
            </div>
            <footer className={"page-footer"}>
                <h3>JOSE HENRIQUE PINTO JOANONI® - 2024/2025</h3>
            </footer>
        </>
    )
}

/* INSERT FORM */
const InsertForm = ({onSubmit}) => {
    const [formData, setFormData] = useState({
        attrId: "",
        attrName: "",
        attrLatitude: "",
        attrLongitude: "",
        attrAddress: "",
        attrDescription: "",
        attrPhoneNumber: "",
        attrPhotoURL: [],
        attrTags: "",
        attrRating: 0,
        attrFree: false
    })

    /* HANDLE FORM CHANGE */
    const handleChange = (ev) => {
        const {name, value, type, checked} = ev.target
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === "checkbox" ? checked : value
        }))
    }

    const handleRatingChange = (rating) => {
        setFormData(prevData => ({
            ...prevData,
            attrRating: rating,
        }))
    }

    const handleUploadImage = (img) => {
        setFormData(prevData => ({
            ...prevData,
            attrPhotoURL: img.target.files
        }))
    }

    const handleSubmit = (ev) => {
        ev.preventDefault()
        onSubmit(formData)
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="row">
                <div className="col">
                    <label htmlFor="attrId">Attraction ID</label>
                    <input
                        className="form-control"
                        type="text"
                        name="attrId"
                        value={formData.attrId}
                        onChange={handleChange}
                    />
                </div>

                <div className="col">
                    <label htmlFor="attrName">Attraction Name</label>
                    <input
                        className="form-control"
                        type="text"
                        name="attrName"
                        value={formData.attrName}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="row mt-2">
                <div className="col">
                    <label htmlFor="attrLatitude">Latitude</label>
                    <input
                        className="form-control"
                        type="text"
                        name="attrLatitude"
                        value={formData.attrLatitude}
                        onChange={handleChange}
                    />
                </div>

                <div className="col">
                    <label htmlFor="attrLongitude">Longitude</label>
                    <input
                        className="form-control"
                        type="text"
                        name="attrLongitude"
                        value={formData.attrLongitude}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="mt-2">
                <label htmlFor="attrAddress">Address</label>
                <input
                    className="form-field w-100"
                    type="text"
                    name="attrAddress"
                    value={formData.attrAddress}
                    onChange={handleChange}
                />
            </div>

            <div className="mt-2">
                <label htmlFor="attrDescription">Description</label>
                <textarea
                    className="form-control"
                    name="attrDescription"
                    cols="30"
                    rows="5"
                    value={formData.attrDescription}
                    onChange={handleChange}>
            </textarea>
            </div>

            <div className="mt-2">
                <label htmlFor="attrPhoneNumber">Phone Number</label>
                <input
                    className="form-field w-100"
                    type="text"
                    name="attrPhoneNumber"
                    value={formData.attrPhoneNumber}
                    onChange={handleChange}
                />
            </div>

            {/**********************************************************************************************************
             *                                  BELOW CODE CODE BASED ON:                                               *
             * - https://cloudinary.com/blog/how-to-upload-multiple-images-at-once-in-react                             *
             *                                                                                                          *
             **********************************************************************************************************/}

            <div className="row mt-2">
                <div className="col">
                    <label htmlFor="attrPhotoURL">Photos</label>
                    <input
                        className="form-control"
                        type="file"
                        name="attrPhotoURL"
                        multiple
                        onChange={handleUploadImage}
                    />
                </div>

                <div className="col">
                    <label htmlFor="attrTags">Tags</label>
                    <input
                        className="form-control"
                        type="text"
                        name="attrTags"
                        value={formData.attrTags}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="mt-2">
                <div className="form-group">
                    <label>Rating</label>
                    <div>
                        {[1, 2, 3, 4, 5].map((num) => (
                            <label key={num} className="form-check form-check-inline">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="attrRating"
                                    checked={formData.attrRating === num}
                                    onChange={() => handleRatingChange(num)}
                                />
                                {num}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-check-label" htmlFor="attrFree">
                        Free attraction?
                    </label>
                    <input
                        className="form-check-input ms-2"
                        type="checkbox"
                        name="attrFree"
                        checked={formData.attrFree}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <Modal.Footer>
                <Button variant="primary" type="submit">Insert</Button>
            </Modal.Footer>
        </form>
    )
}

/* UPDATE FORM */
const UpdateForm = ({updatedAttraction, onSubmit}) => {
    const [formData, setFormData] = useState({
        attrId: "",
        attrName: "",
        attrLatitude: "",
        attrLongitude: "",
        attrAddress: "",
        attrDescription: "",
        attrPhoneNumber: "",
        attrPhotoURL: [],
        attrTags: "",
        attrRating: 0,
        attrFree: false
    })

    useEffect(() => {
        if (updatedAttraction) {
            setFormData({
                attrId: updatedAttraction.id,
                attrName: updatedAttraction.name,
                attrLatitude: updatedAttraction.latitude,
                attrLongitude: updatedAttraction.longitude,
                attrAddress: updatedAttraction.address,
                attrDescription: updatedAttraction.description,
                attrPhoneNumber: updatedAttraction.phoneNumber || "",
                attrPhotoURL: updatedAttraction.photosURLs || [],
                attrTags: updatedAttraction.tags ? updatedAttraction.tags.join(", ") : "",
                attrRating: updatedAttraction.rating,
                attrFree: updatedAttraction.free
            })
        }
    }, [updatedAttraction])

    const handleChange = (ev) => {
        const {name, value, type, checked} = ev.target
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === "checkbox" ? checked : value
        }))
    }

    const handleRatingChange = (rating) => {
        setFormData((prevData) => ({
            ...prevData,
            attrRating: rating
        }))
    }

    const handleUploadImage = (ev) => {
        const filesArray = Array.from(ev.target.files)
        setFormData((prevData) => ({
            ...prevData,
            attrPhotoURL: filesArray
        }))
    }

    const handleSubmit = (ev) => {
        ev.preventDefault()
        onSubmit(formData)
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="row">
                <div className="col">
                    <label htmlFor="attrId">Attraction ID</label>
                    <input
                        className="form-control"
                        type="text"
                        name="attrId"
                        value={formData.attrId}
                        onChange={handleChange}
                    />
                </div>

                <div className="col">
                    <label htmlFor="attrName">Attraction Name</label>
                    <input
                        className="form-control"
                        type="text"
                        name="attrName"
                        value={formData.attrName}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="row mt-2">
                <div className="col">
                    <label htmlFor="attrLatitude">Latitude</label>
                    <input
                        className="form-control"
                        type="text"
                        name="attrLatitude"
                        value={formData.attrLatitude}
                        onChange={handleChange}
                    />
                </div>

                <div className="col">
                    <label htmlFor="attrLongitude">Longitude</label>
                    <input
                        className="form-control"
                        type="text"
                        name="attrLongitude"
                        value={formData.attrLongitude}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="mt-2">
                <label htmlFor="attrAddress">Address</label>
                <input
                    className="form-field w-100"
                    type="text"
                    name="attrAddress"
                    value={formData.attrAddress}
                    onChange={handleChange}
                />
            </div>

            <div className="mt-2">
                <label htmlFor="attrDescription">Description</label>
                <textarea
                    className="form-control"
                    name="attrDescription"
                    cols="30"
                    rows="5"
                    value={formData.attrDescription}
                    onChange={handleChange}>
            </textarea>
            </div>

            <div className="mt-2">
                <label htmlFor="attrPhoneNumber">Phone Number</label>
                <input
                    className="form-field w-100"
                    type="text"
                    name="attrPhoneNumber"
                    value={formData.attrPhoneNumber}
                    onChange={handleChange}
                />
            </div>

            <div className="row mt-2">
                <div className="col">
                    <label htmlFor="attrPhotoURL">Photos</label>
                    <input
                        className="form-control"
                        type="file"
                        name="attrPhotoURL"
                        multiple
                        onChange={handleUploadImage}
                    />
                </div>

                <div className="col">
                    <label htmlFor="attrTags">Tags</label>
                    <input
                        className="form-control"
                        type="text"
                        name="attrTags"
                        value={formData.attrTags}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="mt-2">
                <div className="form-group">
                    <label>Rating</label>
                    <div>
                        {[1, 2, 3, 4, 5].map((num) => (
                            <label key={num} className="form-check form-check-inline">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="attrRating"
                                    value={num}
                                    checked={formData.attrRating === num}
                                    onChange={() => handleRatingChange(num)}
                                />
                                {num}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-check-label" htmlFor="attrFree">
                        Free attraction?
                    </label>
                    <input
                        className="form-check-input ms-2"
                        type="checkbox"
                        name="attrFree"
                        checked={formData.attrFree}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <Modal.Footer>
                <Button variant="primary" type="submit">Update</Button>
            </Modal.Footer>
        </form>
    )
}

export default App
