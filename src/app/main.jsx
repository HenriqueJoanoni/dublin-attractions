import React, { Component } from 'react'
import ReactDOM from 'react-dom/client'
// import App from './App.jsx'
import '../assets/scss/App.scss'
import { Navbar, Container, Form, Button, Table, Spinner, Pagination, Modal, Carousel } from 'react-bootstrap';

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            locations: [],
            searchQuery: '',
            sortConfig: {key: null, direction: 'asc'},
            showModal: false,
            selectedPhotos: [],
            currentLocation: '',
            showModalForm: false,
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
        };

        this.handleResize = this.handleResize.bind(this);
        this.handleSearchChange = this.handleSearchChange.bind(this);
        this.handleTagsSearch = this.handleTagsSearch.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.handleShowModal = this.handleShowModal.bind(this);
        this.handleShowModalForms = this.handleShowModalForms.bind(this);
        this.handleShowDeleteModal = this.handleShowDeleteModal.bind(this);
        this.handleFreeAttractions = this.handleFreeAttractions.bind(this);
        this.handleRatingAttractions = this.handleRatingAttractions.bind(this);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        this.handleDeleteElement = this.handleDeleteElement.bind(this);
    }

    componentDidMount() {
        window.addEventListener('resize', this.handleResize);
        this.handleResize();

        fetch('dublin_attractions.json')
            .then(res => res.json())
            .then(data => this.setState({locations: data}));
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }

    handleResize() {
        this.setState({isMobile: window.innerWidth <= 1080});
    }

    handleSearchChange(query) {
        this.setState({searchQuery: query});
    }

    handleTagsSearch(query) {
        this.setState({filterByTags: query});
    }

    handleSort(key) {
        const direction = this.state.sortConfig.key === key && this.state.sortConfig.direction === 'asc' ? 'desc' : 'asc';
        this.setState({sortConfig: {key, direction}});
    }

    handleShowModal(photos, location) {
        this.setState({selectedPhotos: photos, currentLocation: location, showModal: true});
    }

    handleShowModalForms(formType) {
        this.setState({showModalForm: true, currentForm: formType});
    }

    handleShowDeleteModal(attractionID, attractionName) {
        this.setState({showDeleteModal: true, deleteAttractionID: attractionID, deleteAttractionName: attractionName});
    }

    handleFreeAttractions() {
        this.setState(prevState => ({filterByFreeAttractions: !prevState.filterByFreeAttractions}));
    }

    handleRatingAttractions() {
        this.setState(prevState => ({filterByRating: !prevState.filterByRating}));
    }

    handleFormSubmit(newAttractionData) {
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
        };

        this.setState(prevState => {
            const locations = [...prevState.locations];
            const index = locations.findIndex(item => item.id === newAttraction.id);
            if (index !== -1) {
                locations[index] = newAttraction;
            } else {
                locations.push(newAttraction);
            }
            return {locations};
        });
    }

    handleDeleteElement(attractionID) {
        this.setState(prevState => ({
            deleteAttraction: prevState.deleteAttraction.filter(attraction => attraction.id !== attractionID),
            locations: prevState.locations.filter(location => location.id !== attractionID),
            showDeleteModal: false,
        }));
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
        } = this.state;

        const sortedLocations = [...locations].sort((a, b) => {
            if (sortConfig.key) {
                const aValue = a[sortConfig.key] || '';
                const bValue = b[sortConfig.key] || '';
                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });

        const searchFreeAttractions = (description) => {
            return description.toLowerCase().includes('free')
        }

        const getSortIcon = (columnName) => {
            const {sortColumn, sortOrder} = this.state;
            if (sortColumn !== columnName) {
                return null;
            }
            return sortOrder === 'asc' ? '▲' : '▼';
        }

        const filteredLocations = sortedLocations.filter(location => {
            const matchesSearchQuery = location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                location.address.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesTags = filterByTags ?
                location.tags.some(tag => tag.toLowerCase().includes(filterByTags.toLowerCase())) :
                true;

            const matchesFreeAttractions = filterByFreeAttractions ?
                location.description.toLowerCase().includes('free') :
                true;

            const matchesRating = filterByRating ?
                location.rating > 4.5 :
                true;

            return matchesSearchQuery && matchesTags && matchesFreeAttractions && matchesRating;
        });

        const indexOfLastPost = currentPage * postsPerPage;
        const indexOfFirstPost = indexOfLastPost - postsPerPage;
        const currentPosts = isMobile ? filteredLocations : filteredLocations.slice(indexOfFirstPost, indexOfLastPost);

        return (
            <>
                <NavigationBar/>

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
                                    onChange={e => this.handleSearchChange(e.target.value)}
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
                                    onChange={e => this.handleTagsSearch(e.target.value)}
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
                                    onChange={this.handleFreeAttractions}
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
                                    onChange={this.handleRatingAttractions}
                                    checked={filterByRating}
                                />
                            </Form>
                        </div>
                        <div className={"col-lg-3 col-md-6 col-sm-12 d-flex align-items-center"}>
                            {/* INSERT BUTTON */}
                            <button className={"insert-button"}
                                    onClick={() => this.handleShowModalForms("insert new attraction")}>Insert new
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
                                                    <ShowModalUpdateForm/>
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
                    {/*<Modal show={this.showModalForm} onHide={() => setShowModalForm(false)} size={"xl"} centered>*/}
                    {/*    <Modal.Header closeButton>*/}
                    {/*        <Modal.Title className={"modal-title"}>{currentForm}</Modal.Title>*/}
                    {/*    </Modal.Header>*/}
                    {/*    <Modal.Body>*/}
                    {/*        {currentForm.toLowerCase().includes('insert') ?*/}
                    {/*            <InsertForm onSubmit={this.handleFormSubmit}/> :*/}
                    {/*            <UpdateForm updatedAttraction={this.updatedAttraction} onSubmit={this.handleFormSubmit}/>*/}
                    {/*        }*/}
                    {/*    </Modal.Body>*/}
                    {/*</Modal>*/}
                </div>
                <PageFooter/>
            </>
        );
    }
}

class PaginationComponent extends React.Component {
    constructor(props) {
        super(props);
        this.handlePageClick = this.handlePageClick.bind(this);
    }

    calculatePaginationNumbers() {
        const {totalItems, postsPerPage} = this.props;
        const totalPages = Math.ceil(totalItems / postsPerPage);
        return Array.from({length: totalPages}, (_, i) => i + 1);
    }

    handlePageClick(pageNumber) {
        this.props.onPageChange(pageNumber);
    }

    render() {
        const {currentPage} = this.props;
        const paginationNumbers = this.calculatePaginationNumbers();

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
        );
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
        super(props);
        this.state = {
            showDeleteModal: false,
        };
        this.handleShowModal = this.handleShowModal.bind(this);
        this.handleCloseModal = this.handleCloseModal.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
    }

    handleShowModal() {
        this.setState({showDeleteModal: true});
    }

    handleCloseModal() {
        this.setState({showDeleteModal: false});
    }

    handleDelete() {
        this.props.onDelete(this.props.attractionID);
        this.handleCloseModal();
    }

    render() {
        const {attractionName} = this.props;
        const {showDeleteModal} = this.state;

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
        );
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

class ShowModalUpdateForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            updatedAttraction: null,
            showModal: false,
        }
    }

    setUpdatedAttraction = (item) => {
        this.setState({updatedAttraction: item})
    }

    handleShowModalForms = (type) => {
        this.setState({showModal: true, modalType: type})
    }

    render() {
        return (
            <button
                className="update-button crud-buttons"
                onClick={() => {
                    this.handleShowModalForms("update attraction")
                    this.setUpdatedAttraction(item)
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
        )
    }
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>,
)
