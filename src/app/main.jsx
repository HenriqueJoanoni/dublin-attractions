import React, { Component } from 'react'
import ReactDOM from 'react-dom/client'
import '../assets/scss/App.scss'
import { Navbar, Container, Form, Button, Table, Spinner, Pagination, Modal, Carousel } from 'react-bootstrap'

class App extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            locations: [],
            searchQuery: '',
            sortConfig: {key: null, direction: 'asc'},
            showModal: false,
            selectedPhotos: [],
            currentLocation: '',
            showModalInsertForm: false,
            showUpdateModal: false,
            selectedAttraction: null,
            currentForm: '',
            showDeleteModal: false,
            deleteAttractionID: '',
            deleteAttractionName: '',
            filterByFreeAttractions: false,
            filterByTags: '',
            deleteAttraction: [],
            updatedAttraction: [],
            filterByRating: false,
            postsPerPage: 10,
            currentPage: 1,
            isMobile: false,
        }

        this.handleResize = this.handleResize.bind(this)
        this.handleSearchChange = this.handleSearchChange.bind(this)
        this.handleTagsSearch = this.handleTagsSearch.bind(this)
        this.handleSort = this.handleSort.bind(this)
        this.handleShowModal = this.handleShowModal.bind(this)
        this.handleShowDeleteModal = this.handleShowDeleteModal.bind(this)
        this.handleFreeAttractions = this.handleFreeAttractions.bind(this)
        this.handleRatingAttractions = this.handleRatingAttractions.bind(this)
        this.handleFormSubmit = this.handleFormSubmit.bind(this)
        this.handleDeleteElement = this.handleDeleteElement.bind(this)
        this.closeModalInsertForm = this.closeModalInsertForm.bind(this)
    }

    /**********************************************************************************************************
     *                                  RESIZE CODE CODE BASED ON:                                            *
     * - https://medium.com/@christian_maehler/handle-window-resizing-with-a-react-context-4392b47285e4       *
     * - https://medium.com/@bomber.marek/how-to-check-for-window-resizing-in-react-6b57d0ed7776              *
     *                                                                                                        *
     **********************************************************************************************************/

    componentDidMount() {
        window.addEventListener('resize', this.handleResize)
        this.handleResize()

        fetch('dublin_attractions.json')
            .then(res => res.json())
            .then(data => this.setState({locations: data}))
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize)
    }

    handleResize() {
        this.setState({isMobile: window.innerWidth <= 1080})
    }

    handleSearchChange(query) {
        this.setState({searchQuery: query})
    }

    handleTagsSearch(query) {
        this.setState({filterByTags: query})
    }

    handleSort(key) {
        const direction = this.state.sortConfig.key === key && this.state.sortConfig.direction === 'asc' ? 'desc' : 'asc'
        this.setState({sortConfig: {key, direction}})
    }

    handleShowModal(photos, location) {
        this.setState({selectedPhotos: photos, currentLocation: location, showModal: true})
    }

    handleShowDeleteModal(attractionID, attractionName) {
        this.setState({showDeleteModal: true, deleteAttractionID: attractionID, deleteAttractionName: attractionName})
    }

    handleShowUpdateModal(attraction) {
        this.setState({
            selectedAttraction: attraction,
            showUpdateModal: true,
        })
    }

    handleFreeAttractions = (checked) => {
        this.setState({filterByFreeAttractions: checked})
    }

    handleRatingAttractions = (checked) => {
        this.setState({filterByRating: checked})
    }

    closeModalInsertForm() {
        this.setState({showModalInsertForm: false})
    }

    handleFormSubmit(newAttractionData) {
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
            free: newAttractionData.attrFree,
        }

        this.setState(prevState => {
            const locations = [...prevState.locations]
            const index = locations.findIndex(item => item.id === newAttraction.id)
            if (index !== -1) {
                locations[index] = newAttraction
            } else {
                locations.push(newAttraction)
            }
            return {locations}
        })
    }

    handleDeleteElement(attractionID) {
        this.setState(prevState => ({
            deleteAttraction: prevState.deleteAttraction.filter(attraction => attraction.id !== attractionID),
            locations: prevState.locations.filter(location => location.id !== attractionID),
            showDeleteModal: false,
        }))
    }

    handlePageChange = (pageNumber) => {
        this.setState({currentPage: pageNumber})
    }

    render() {
        const {
            locations,
            searchQuery,
            filterByTags,
            filterByFreeAttractions,
            filterByRating,
            currentPage,
            postsPerPage,
            isMobile,
            sortConfig
        } = this.state

        const sortedLocations = [...locations].sort((a, b) => {
            if (sortConfig.key) {
                const aValue = a[sortConfig.key] || ''
                const bValue = b[sortConfig.key] || ''
                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
            }
            return 0
        })

        const searchFreeAttractions = (description) => {
            return description.toLowerCase().includes('free')
        }

        const getSortIcon = (columnName) => {
            if (sortConfig.key !== columnName) {
                return null
            }
            return sortConfig.direction === 'asc' ? '▲' : '▼'
        }

        const filteredLocations = sortedLocations.filter(location => {
            const matchesSearchQuery = location?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                location?.address?.toLowerCase().includes(searchQuery.toLowerCase())

            const matchesTags = filterByTags ?
                location?.tags?.some(tag => tag.toLowerCase().includes(filterByTags.toLowerCase())) :
                true

            const matchesFreeAttractions = filterByFreeAttractions ?
                location?.description?.toLowerCase().includes('free') :
                true

            const matchesRating = filterByRating ?
                location?.rating > 4.5 :
                true

            return matchesSearchQuery && matchesTags && matchesFreeAttractions && matchesRating
        })

        /**********************************************************************************************************
         *                                  BELOW CODE CODE BASED ON:                                             *
         * - https://medium.com/@techvoot.solutions/how-to-implement-pagination-in-your-react-js-e6b53043c84e     *
         * - https://dev.to/canhamzacode/how-to-implement-pagination-with-reactjs-2b04                            *
         *                                                                                                        *
         **********************************************************************************************************/

        const indexOfLastPost = currentPage * postsPerPage
        const indexOfFirstPost = indexOfLastPost - postsPerPage
        const currentPosts = isMobile ? filteredLocations : filteredLocations.slice(indexOfFirstPost, indexOfLastPost)

        return (
            <>
                <NavigationBar/>

                <div className="space-around">
                    <div className="row">
                        <SearchFilterSort
                            onSearch={this.handleSearchChange}
                            onTagSearch={this.handleSearchChange}
                            onFreeAttractions={this.handleFreeAttractions}
                            onRatingAttractions={this.handleRatingAttractions}
                        />

                        <div className="col-lg-3 col-md-6 col-sm-12 d-flex align-items-center">
                            <button
                                className="insert-button"
                                onClick={() => this.setState({showModalInsertForm: true})}
                            >
                                Insert new
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
                                            onClick={() => this.handleSort('id')}>ID {getSortIcon('id')}</th>
                                        <th className={"sort-row"}
                                            onClick={() => this.handleSort('name')}>Name {getSortIcon('name')}</th>
                                        <th>Latitude</th>
                                        <th>Longitude</th>
                                        <th>Address</th>
                                        <th>Description</th>
                                        <th>Phone Number</th>
                                        <th>Images</th>
                                        <th>Tags</th>
                                        <th className={"sort-row"}
                                            onClick={() => this.handleSort('rating')}>Rating {getSortIcon('rating')}</th>
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
                                                    <Button
                                                        onClick={() => this.handleShowModal(item.photosURLs, item.name)}>
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
                                                        onClick={() => this.handleShowUpdateModal(item)}
                                                    >
                                                        <img
                                                            src="/src/assets/img/pencil.png"
                                                            width="20"
                                                            height="20"
                                                            alt="pencil icon"
                                                            title="Edit Element"
                                                        />
                                                    </button>
                                                    <DeleteModal
                                                        attractionID={item.id}
                                                        attractionName={item.name}
                                                        onDelete={this.handleDeleteElement}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </Table>
                                {!isMobile && (
                                    <div className="pagination-container">
                                        <PaginationComponent
                                            totalItems={filteredLocations.length}
                                            postsPerPage={postsPerPage}
                                            currentPage={currentPage}
                                            onPageChange={this.handlePageChange}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* MODAL PICTURES */}
                    <ModalPictures
                        show={this.state.showModal}
                        photos={this.state.selectedPhotos}
                        locationName={this.state.currentLocation}
                        onClose={() => this.setState({showModal: false})}
                    />

                    {/* MODAL FORMS */}
                    <InsertForm
                        handleFormSubmit={this.handleFormSubmit}
                        showModal={this.state.showModalInsertForm}
                        closeModal={this.closeModalInsertForm}
                    />

                    {/* UPDATE MODAL */}
                    <UpdateModal
                        show={this.state.showUpdateModal}
                        locationData={this.state.selectedAttraction}
                        onClose={()=>this.setState({showUpdateModal: false})}
                        onSubmit={this.handleFormSubmit}
                    />
                </div>
                <PageFooter/>
            </>
        )
    }
}

class PaginationComponent extends React.Component {
    constructor(props) {
        super(props)
        this.handlePageClick = this.handlePageClick.bind(this)
    }

    calculatePaginationNumbers() {
        const {totalItems, postsPerPage} = this.props
        const totalPages = Math.ceil(totalItems / postsPerPage)
        return Array.from({length: totalPages}, (_, i) => i + 1)
    }

    handlePageClick(pageNumber) {
        this.props.onPageChange(pageNumber)
    }

    render() {
        const {currentPage} = this.props
        const paginationNumbers = this.calculatePaginationNumbers()

        return (
            <Pagination className="pagination-custom">
                {paginationNumbers.map(number => (
                    <Pagination.Item
                        key={number}
                        active={number === currentPage}
                        onClick={() => this.handlePageClick(number)}
                        className={number === currentPage ? 'active-pagination-item' : ''}
                    >
                        {number}
                    </Pagination.Item>
                ))}
            </Pagination>
        )
    }
}

class ModalPictures extends React.Component {
    render() {
        const {show, photos, locationName, onClose} = this.props

        return (
            <Modal show={show} onHide={onClose} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>{locationName}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Carousel>
                        {photos.map((pic, index) => (
                            <Carousel.Item key={index}>
                                <img className="d-block w-100" src={pic} alt={`Slide ${index + 1}`}/>
                            </Carousel.Item>
                        ))}
                    </Carousel>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onClose}>Close</Button>
                </Modal.Footer>
            </Modal>
        )
    }
}

class DeleteModal extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            showDeleteModal: false,
        }
        this.handleShowModal = this.handleShowModal.bind(this)
        this.handleCloseModal = this.handleCloseModal.bind(this)
        this.handleDelete = this.handleDelete.bind(this)
    }

    handleShowModal() {
        this.setState({showDeleteModal: true})
    }

    handleCloseModal() {
        this.setState({showDeleteModal: false})
    }

    handleDelete() {
        this.props.onDelete(this.props.attractionID)
        this.handleCloseModal()
    }

    render() {
        const {attractionName} = this.props
        const {showDeleteModal} = this.state

        return (
            <>
                {/* Delete Button */}
                <button
                    className="delete-button crud-buttons"
                    onClick={this.handleShowModal}
                >
                    <img
                        src="/src/assets/img/recycle-bin.png"
                        width="20"
                        height="20"
                        alt="trash icon"
                        title="Delete Element"
                    />
                </button>

                {/* Delete Confirmation Modal */}
                <Modal show={showDeleteModal} onHide={this.handleCloseModal} size="lg" centered>
                    <Modal.Header closeButton>
                        <Modal.Title className="modal-title">Delete {attractionName}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <h3>Are you sure you want to delete <b>{attractionName}</b>?</h3>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" onClick={this.handleDelete}>
                            Yes, delete
                        </Button>
                        <Button variant="secondary" onClick={this.handleCloseModal}>
                            No
                        </Button>
                    </Modal.Footer>
                </Modal>
            </>
        )
    }
}

class NavigationBar extends React.Component {
    render() {
        return (
            <Navbar className="navbar-background box-shadow-custom">
                <Container>
                    <Navbar.Brand href="#home">
                        <div className="d-flex justify-content-between">
                            <div className="header-logo">
                                <img src="/src/assets/img/destination.png" width="60" height="60"
                                     alt="destination logo"/>
                            </div>
                            <div className="navbar-text-custom ms-3">Dublin Locations Project</div>
                        </div>
                    </Navbar.Brand>
                </Container>
            </Navbar>
        )
    }
}

class PageFooter extends React.Component {
    render() {
        return (
            <footer className={"page-footer"}>
                <h3>JOSE HENRIQUE PINTO JOANONI® - 2024/2025</h3>
            </footer>
        )
    }
}

class SearchFilterSort extends Component {
    constructor(props) {
        super(props)

        this.state = {
            searchQuery: '',
            filterByTags: '',
            filterByFreeAttractions: false,
            filterByRating: false,
        }
    }

    handleSearchChange = (query) => {
        this.setState({searchQuery: query})
        this.props.onSearch(query)
    }

    handleTagsSearch = (query) => {
        this.setState({filterByTags: query})
        this.props.onTagSearch(query)
    }

    handleFreeAttractions = () => {
        this.setState(prevState => {
            const newState = {filterByFreeAttractions: !prevState.filterByFreeAttractions}
            this.props.onFreeAttractions(newState.filterByFreeAttractions)
            return newState
        })
    }

    handleRatingAttractions = () => {
        this.setState(prevState => {
            const newState = {filterByRating: !prevState.filterByRating}
            this.props.onRatingAttractions(newState.filterByRating)
            return newState
        })
    }

    render() {
        const {searchQuery, filterByTags, filterByFreeAttractions, filterByRating} = this.state

        return (
            <>
                <div className="col-lg-3 col-md-6 col-sm-12 mb-3">
                    {/* SEARCH BY NAME AND ADDRESS */}
                    <form>
                        <label htmlFor="searchLocation">Search By Name or Address</label>
                        <input
                            className="search-field box-shadow-custom w-100"
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={e => this.handleSearchChange(e.target.value)}
                        />
                    </form>
                </div>
                <div className="col-lg-3 col-md-6 col-sm-12 mb-3">
                    {/* SEARCH BY TAGS */}
                    <form>
                        <label htmlFor="searchTags">Search By Tags</label>
                        <input
                            className="search-field box-shadow-custom w-100"
                            type="text"
                            placeholder="Search Tags..."
                            value={filterByTags}
                            onChange={e => this.handleTagsSearch(e.target.value)}
                        />
                    </form>
                </div>
                <div className="col-lg-3 col-md-6 col-sm-12 d-flex align-items-center">
                    {/* FILTER BY FREE ATTRACTIONS */}
                    <Form className="w-100">
                        <Form.Check
                            className="mt-2"
                            type="switch"
                            id="custom-switch"
                            label="Free activities only"
                            onChange={this.handleFreeAttractions}
                            checked={filterByFreeAttractions}
                        />
                    </Form>

                    {/* FILTER BY RATING */}
                    <Form className="w-100">
                        <Form.Check
                            className="mt-2"
                            type="switch"
                            id="custom-switch"
                            label="5 star attractions"
                            onChange={this.handleRatingAttractions}
                            checked={filterByRating}
                        />
                    </Form>
                </div>
            </>
        )
    }
}

class InsertForm extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            formData: {
                attrId: '',
                attrName: '',
                attrLatitude: '',
                attrLongitude: '',
                attrAddress: '',
                attrDescription: '',
                attrPhoneNumber: '',
                attrPhotos: [],
                attrTags: '',
                attrRating: 1,
                attrFree: false
            },
        }

        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleUploadImage = this.handleUploadImage.bind(this)
    }

    handleChange(event) {
        const {name, value, type, checked} = event.target
        this.setState(prevState => ({
            formData: {
                ...prevState.formData,
                [name]: type === 'checkbox' ? checked : value,
            }
        }))
    }

    handleRatingChange(rating) {
        this.setState(prevData => ({
            formData: {
                ...prevData.formData,
                attrRating: rating,
            }
        }))
    }

    handleUploadImage(event) {
        const files = event.target.files
        const fileArray = Array.from(files)
        this.setState(prevState => ({
            formData: {
                ...prevState.formData,
                attrPhotos: [...prevState.formData.attrPhotos, ...fileArray]
            }
        }))
    }

    handleSubmit(event) {
        event.preventDefault()
        this.props.handleFormSubmit(this.state.formData)
        this.props.closeModal()
    }

    render() {
        return (
            <Modal show={this.props.showModal} onHide={this.props.closeModal} size={"xl"} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Insert New Attraction</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={this.handleSubmit}>
                        <div className="row">
                            <div className="col">
                                <label htmlFor="attrId">Attraction ID</label>
                                <input
                                    className="form-control"
                                    type="text"
                                    name="attrId"
                                    value={this.state.formData.attrId}
                                    onChange={this.handleChange}
                                />
                            </div>

                            <div className="col">
                                <label htmlFor="attrName">Attraction Name</label>
                                <input
                                    className="form-control"
                                    type="text"
                                    name="attrName"
                                    value={this.state.formData.attrName}
                                    onChange={this.handleChange}
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
                                    value={this.state.formData.attrLatitude}
                                    onChange={this.handleChange}
                                />
                            </div>

                            <div className="col">
                                <label htmlFor="attrLongitude">Longitude</label>
                                <input
                                    className="form-control"
                                    type="text"
                                    name="attrLongitude"
                                    value={this.state.formData.attrLongitude}
                                    onChange={this.handleChange}
                                />
                            </div>
                        </div>

                        <div className="mt-2">
                            <label htmlFor="attrAddress">Address</label>
                            <input
                                className="form-field w-100"
                                type="text"
                                name="attrAddress"
                                value={this.state.formData.attrAddress}
                                onChange={this.handleChange}
                            />
                        </div>

                        <div className="mt-2">
                            <label htmlFor="attrDescription">Description</label>
                            <textarea
                                className="form-control"
                                name="attrDescription"
                                cols="30"
                                rows="5"
                                value={this.state.formData.attrDescription}
                                onChange={this.handleChange}>
                            </textarea>
                        </div>

                        <div className="mt-2">
                            <label htmlFor="attrPhoneNumber">Phone Number</label>
                            <input
                                className="form-field w-100"
                                type="text"
                                name="attrPhoneNumber"
                                value={this.state.formData.attrPhoneNumber}
                                onChange={this.handleChange}
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
                                    onChange={this.handleUploadImage}
                                />
                            </div>

                            <div className="col">
                                <label htmlFor="attrTags">Tags</label>
                                <input
                                    className="form-control"
                                    type="text"
                                    name="attrTags"
                                    value={this.state.formData.attrTags}
                                    onChange={this.handleChange}
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
                                                checked={this.state.formData.attrRating === num}
                                                onChange={() => this.handleRatingChange(num)}
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
                                    checked={this.state.formData.attrFree}
                                    onChange={this.handleChange}
                                />
                            </div>
                        </div>

                        <Modal.Footer>
                            <Button variant="primary" type="submit">Insert</Button>
                        </Modal.Footer>
                    </form>
                </Modal.Body>
            </Modal>
        )
    }
}

class UpdateModal extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            attrId: props.locationData?.id || '',
            attrName: props.locationData?.name || '',
            attrLatitude: props.locationData?.latitude || '',
            attrLongitude: props.locationData?.longitude || '',
            attrAddress: props.locationData?.address || '',
            attrDescription: props.locationData?.description || '',
            attrPhoneNumber: props.locationData?.phoneNumber || '',
            attrTags: props.locationData?.tags ? props.locationData.tags.join(', ') : '',
            attrRating: props.locationData?.rating || '',
            attrFree: props.locationData?.free || false,
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.locationData && this.props.locationData !== prevProps.locationData) {
            this.setState({
                attrId: this.props.locationData.id || '',
                attrName: this.props.locationData.name || '',
                attrLatitude: this.props.locationData.latitude || '',
                attrLongitude: this.props.locationData.longitude || '',
                attrAddress: this.props.locationData.address || '',
                attrDescription: this.props.locationData.description || '',
                attrPhoneNumber: this.props.locationData.phoneNumber || '',
                attrTags: this.props.locationData.tags ? this.props.locationData.tags.join(', ') : '',
                attrRating: this.props.locationData.rating || '',
                attrFree: this.props.locationData.free || false,
            })
        }
    }

    handleChange = (e) => {
        const {name, value} = e.target
        this.setState({[name]: value})
    }

    handlePhotoChange = (event) => {
        const files = Array.from(event.target.files)
        const photosURLs = files.map(file => URL.createObjectURL(file))
        this.setState({photosURLs})
    }

    handleCheckboxChange = (e) => {
        this.setState({attrRating: parseInt(e.target.value)})
    }

    handleSubmit = (e) => {
        e.preventDefault()
        const updatedData = {...this.state}
        this.props.onSubmit(updatedData)
    }

    render() {
        const {show, onClose} = this.props
        return (
            <Modal show={show} onHide={onClose} size={"xl"} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Update Attraction</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={this.handleSubmit}>
                        <div className="row">
                            <div className="col">
                                <label htmlFor="attrId">Attraction ID</label>
                                <input
                                    className="form-control"
                                    type="text"
                                    name="attrId"
                                    value={this.state.attrId}
                                    onChange={this.handleChange}
                                />
                            </div>

                            <div className="col">
                                <label htmlFor="attrName">Attraction Name</label>
                                <input
                                    className="form-control"
                                    type="text"
                                    name="attrName"
                                    value={this.state.attrName}
                                    onChange={this.handleChange}
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
                                    value={this.state.attrLatitude}
                                    onChange={this.handleChange}
                                />
                            </div>

                            <div className="col">
                                <label htmlFor="attrLongitude">Longitude</label>
                                <input
                                    className="form-control"
                                    type="text"
                                    name="attrLongitude"
                                    value={this.state.attrLongitude}
                                    onChange={this.handleChange}
                                />
                            </div>
                        </div>

                        <div className="mt-2">
                            <label htmlFor="attrAddress">Address</label>
                            <input
                                className="form-field w-100"
                                type="text"
                                name="attrAddress"
                                value={this.state.attrAddress}
                                onChange={this.handleChange}
                            />
                        </div>

                        <div className="mt-2">
                            <label htmlFor="attrDescription">Description</label>
                            <textarea
                                className="form-control"
                                name="attrDescription"
                                cols="30"
                                rows="5"
                                value={this.state.attrDescription}
                                onChange={this.handleChange}>
                            </textarea>
                        </div>

                        <div className="mt-2">
                            <label htmlFor="attrPhoneNumber">Phone Number</label>
                            <input
                                className="form-field w-100"
                                type="text"
                                name="attrPhoneNumber"
                                value={this.state.attrPhoneNumber}
                                onChange={this.handleChange}
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
                                    onChange={this.handlePhotoChange}
                                />
                            </div>

                            <div className="col">
                                <label htmlFor="attrTags">Tags</label>
                                <input
                                    className="form-control"
                                    type="text"
                                    name="attrTags"
                                    value={this.state.attrTags}
                                    onChange={this.handleChange}
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
                                                checked={this.state.attrRating === num}
                                                onChange={(e) => this.handleCheckboxChange(e)}
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
                                    checked={this.state.attrFree}
                                    onChange={this.handleChange}
                                />
                            </div>
                        </div>

                        <Modal.Footer>
                            <Button variant="secondary" onClick={onClose}>Close</Button>
                            <Button variant="primary" type="submit">Update</Button>
                        </Modal.Footer>
                    </form>
                </Modal.Body>
            </Modal>
        )
    }
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>,
)
