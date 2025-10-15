import React, { useState, useEffect, useContext } from 'react';
import firebase from '../../config/Fire';
import { storage } from "../../config/Fire";
import Axios from "axios";
import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import { AuthContext } from '../../context/Auth';
import $ from 'jquery';
import parse from 'html-react-parser';
import Loader from "../../common/Loader/Loader";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
// import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage';
import BlogData from '../../components/ProductsData/ProductsData';
import ProductsData from '../../components/ProductsData/ProductsData';

var metadata = {
  contentType: 'image/jpeg',
};
var tem = 1;
class MyUploadAdapter {
  constructor(loader) {
    this.loader = loader;
  }
  // Starts the upload process.
  upload() {
    return this.loader.file.then(
      file =>
        new Promise((resolve, reject) => {
          let storage = firebase.storage().ref();
          let uploadTask = storage
            .child(`/images/productsData/${file.name}`)
            .put(file, metadata);
          uploadTask.on(
            console.log(uploadTask + "--------------------------------"),
            function () {
              uploadTask.snapshot.ref
                .getDownloadURL()
                .then(function (downloadURL) {
                  resolve({
                    default: downloadURL
                  });
                });
            }
          );
        })
    );
  }
}


function Products(props) {

  const [showModal, setShowModal] = useState(false);

  const { currentUser } = useContext(AuthContext);

  const [postPosition, setPostPosition] = useState("");
  const [postTopic, setPostTopic] = useState("");
  const [postLongDescription, setPostLongDescription] = useState("");
  const [postIsActive, setPostIsActive] = useState("");
  const [formComplete, setFormComplete] = useState(false);
  const [formIncompleteError, setFormIncompleteError] = useState(false);
  const [postIsEvent , setPostIsEvent ] = useState("");

  const [postPositionNo, setPostPositionNo] = useState("");
  const [postImage, setPostImage] = useState("");
  const [postTopicName, setPostTopicName] = useState("");
  const [postLongDetail, setPostLongDetail] = useState("");
  const [postIsActiveStatus, setPostIsActiveStatus] = useState("");
  const [postTimestamp, setPostTimestamp] = useState("");
  const [postIsEventStatus , setPostIsEventStatus ] = useState("");


  const [postData, setPostData] = useState("");
  const [isPostAdded, setIsPostAdded] = useState(false);
  const [isPostEdited, setIsPostEdited] = useState(false);
  const [isPostDelete, setIsPostDelete] = useState(false);

  const [file, setFile] = useState(null);
  const [url, setURL] = useState("");

  const [editDetails, setEditDetails] = useState(false);

  const [postId, setPostId] = useState("");

  const postTopics = React.useRef();
  const postPositions = React.useRef();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsPostAdded(false);
    setIsPostEdited(false);
    setIsPostDelete(false);
    getPostData();
    // filterStatus();
  }, [isPostAdded, isPostEdited, isPostDelete]);

  function handleChange(e) {
    setFile(e.target.files[0]);
  }

  function handleUpload(e) {
    e.preventDefault();
    var today = new Date();
    var time = today.getHours() + "_" + today.getMinutes() + "_" + today.getSeconds();
    const uploadTask = storage.ref(`/images/products/${time + "_" + file.name}`).put(file);
    uploadTask.on("state_changed", console.log, console.error, () => {
      storage
        .ref("images/products")
        .child(time + "_" + file.name)
        .getDownloadURL()
        .then((url) => {
          setFile(null);
          setURL(url);
        });
    });
  }

  const getPostData = () => {
    // Axios
    // .get(`https://software-bazaar-default-rtdb.firebaseio.com/event.json`)
    firebase.database().ref(`products`).get()
      .then((response) => {
        // setPostData(response.data)
        setTimeout(setPostData(response.val()), 5000);
        setLoading(false);
      })
      .catch((error) => console.log(error));
  };

  const handleAddPostData = (e) => {
    //   check if all input is taken
    if (postPositions.current.value.length === 0 || postTopics.current.value.length === 0) {
      setFormComplete(false);
      setFormIncompleteError(true);
    } else {
      if (editDetails) {
        // Axios
        // .put(`https://educaretech-dashboard-default-rtdb.firebaseio.com/SessionData/${postId}.json`,
        firebase.database().ref(`products/${postId}`).set(
          {
            postPositionNo: postPositionNo === "" ? postPosition : postPositionNo,
            postImage: postImage === "" ? url : postImage,
            postTopicName: postTopicName === "" ? postTopic : postTopicName,
            postLongDetail: postLongDetail === "" ? postLongDescription : postLongDetail,
            postIsActiveStatus: postIsActiveStatus === "" ? postIsActive : postIsActiveStatus,
            postIsEventStatus:postIsEventStatus ==="" ? postIsEvent : postIsEventStatus,
            postusername: currentUser.displayName,
            Postuserprofile: currentUser.photoURL,
            postTimestamp: new Date().toUTCString(),
          }
        )
          .then((response) => {
            alert("products edited succesfully");
            window.location.reload();
            setIsPostEdited(true);
          })
          .catch((error) => console.log("Error in editDetails" + error));
      }
      //  if user wants to add a new card
      else {
        // if user wants to edit then put request is used
        // Axios
        // .post(`https://educaretech-dashboard-default-rtdb.firebaseio.com/SessionData.json`,
        firebase.database().ref('products/').push(
          {
            postPositionNo: postPosition,
            postImage: url,
            postTopicName: postTopic,
            postLongDetail: postLongDescription,
            postIsActiveStatus: postIsActive,
            postIsEventStatus : postIsEvent,
            postusername: currentUser.displayName,
            Postuserprofile: currentUser.photoURL,
            postTimestamp: new Date().toUTCString(),

          }
        )
          .then((response) => {
            alert("products added succesfully");
            // swal("succesful!", "post added succesfully!", "success");
            window.location.reload();
            setIsPostAdded(true);
          })
          .catch((error) => console.log("Error" + error));
      }

      setShowModal(false);

      setPostPositionNo("");
      setPostImage("");
      setPostTopicName("");
      setPostLongDetail("");
      setPostIsActiveStatus("");
      setPostIsEventStatus("");
      setPostTimestamp("");

    }
  };

  const handleEdit = (
    postTopic,
    url,
    postLongDescription,
    postPosition,
    postIsActive,
    postIsEvent,
    postId,
    e
  ) => {
    setShowModal(true);
    setEditDetails(true);

    setPostTopic(postTopic);
    setURL(url);
    setPostLongDescription(postLongDescription);
    setPostPosition(postPosition);
    setPostIsActive(postIsActive);
    setPostIsEvent(postIsEvent);
    setPostId(postId);
    console.log(showModal);

  };

  // handles archive on card archive click
  const handleDelete = (postId, e) => {
    if (window.confirm("Are you sure you want to delete the products?")) {
      // Axios
      // .delete(`https://educaretech-dashboard-default-rtdb.firebaseio.com/SessionData/${postId}.json`)
      firebase.database().ref(`products/${postId}`).remove()
        .then((response) => {
          alert("products deleted succesfully");
          window.location.reload();
          setIsPostDelete(true);
        })
        .catch((error) => console.log("Error" + error));
    }
  };

  $(document).ready(function () {
    $('#search-input').keyup(function () {
      // Search text
      var text = $(this).val();
      // Hide all content className element
      $('.session-card').hide();
      // Search and show
      $('.session-card:contains("' + text + '")').show();
    });
  });

  //    const filterStatus = () => {
  //   $('.filter-status').on('change', function() {
  //       // alert( this.value);
  //       $('.session-card').css("display","none");
  //       $('.'+this.value).css("display","table-row");
  //       if(this.value == "all"){
  //         $('.session-card').css("display","table-row");
  //       }
  //   });
  // }

  const modalCloseHandler = () => { setShowModal(false); setEditDetails(false); setURL(false) };

  let modalContent = showModal ?

    (
      <>
        <div className="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true" data-backdrop="static">
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">{editDetails ? "Edit event" : "Add event"}</h5>
                <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={modalCloseHandler}>
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleUpload}>
                  <div className="form-group">
                    {formIncompleteError ? <p style={{ color: 'red' }}>Kindly complete the form before adding Column</p> : null}
                  </div>
                  <div className="form-group">
                    <label for="topic">Event Product Name</label>
                    <input type="text" className="form-control" id="topic"
                      defaultValue={editDetails ? postTopic : ""}
                      ref={postTopics}
                      onChange={(event) => setPostTopic(event.target.value)}
                      placeholder="Enter event Topic Name" />
                  </div>
                  <div className="form-group">
                    <label for="description">Upload Image</label>
                    <div className="custom-file">
                      <input type="file" onChange={handleChange} />
                      <button className="btn btn-dark btn-sm my-2 form-control" disabled={!file}>Click here to upload Image</button>
                      <img src={editDetails ? url : url} width="80" height="80" alt="upload" />
                    </div>
                  </div>
                  <div className="form-group pt-3">
                    <label for="description">Long Description</label>
                    {/* <div id="txtEditor1"></div> */}
                    <CKEditor
                      editor={ClassicEditor}
                      // data={postLongDescription}
                      data={editDetails ? postLongDescription : ""}
                      config={{
                        mediaEmbed: {
                          previewsInData: true
                        }
                      }}
                      onReady={editor => {
                        editor.plugins.get("FileRepository").createUploadAdapter = loader => {
                          return new MyUploadAdapter(loader);
                        };
                      }}
                      onChange={(event, editor) => {
                        const data = editor.getData();
                        setPostLongDescription(data);
                        console.log(data);
                      }}
                    >
                    </CKEditor>
                  </div>
                  <div className="form-row">
                    <div className="form-group col-md-6">
                      <label for="session">Price  </label>
                      <input type="text" className="form-control" id="session"
                        defaultValue={editDetails ? postPosition : ""}
                        ref={postPositions}
                        onChange={(event) => setPostPosition(event.target.value)}
                        placeholder="Enter session" />
                    </div>
                    <div className="form-group col-md-6">
                      <label for="status">Status</label>
                      <select id="status" className="form-control"
                        defaultValue={editDetails ? postIsActive : ""}
                        onChange={(event) => setPostIsActive(event.target.value)}>
                        <option selected>Select Session Status</option>
                        <option value="0">In-Active</option>
                        <option value="1">Active</option>
                      </select>
                    </div>

                    <div className="form-group col-md-6">
                      <label for="status">Product Category</label>
                      <select id="status" className="form-control"
                        defaultValue={editDetails ? postIsEvent : ""}
                        onChange={(event) => setPostIsEvent(event.target.value)}>
                        <option selected>Select Product Category</option>
                        <option value="Fast Food">Fast Food</option>
                        <option value="Deserts">Deserts</option>
                        <option value="Drinks">Drinks</option>
                      </select>
                    </div>


                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" disabled={formComplete} onClick={handleAddPostData} className="btn btn-sm btn-primary">Post</button>
              </div>
            </div>
          </div>
        </div>
      </>
    )
    : null;

  return (
    <>
      <Navbar />
      <div className="wrapper d-flex align-items-stretch">
        <Sidebar />

        <div className="container-fluid main bg-light py-5">
          <div className="row justify-content-center">
            <div className="col-lg-11">

              <div className="add-teacher-profile pb-3">
                <div className="d-flex justify-content-between">
                  <div className="title">
                    <h2 id="teach_profile">Products</h2>
                    {/* <p>International Early Years Programs from Zero to Six. At Home and Online</p> */}
                  </div>
                  <div className="add-post-button">
                    <button onClick={() => setShowModal(true)} className="btn btn-dark btn-sm" data-toggle="modal" data-target="#exampleModal"><i className="fas fa-plus"></i></button>
                  </div>
                </div>
                <div className="m-content">
                  {modalContent}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group col-md-11">
                  <label for="inputEmail4">Search based on Product Name</label>
                  <input type="text" className="form-control" placeholder="search data" id="search-input" />
                </div>
                <div className="form-group col-md-1 reset-btn">
                  <button className="btn btn-primary btn-sm" onClick={() => window.location.reload()}>Reset</button>
                </div>
              </div>

              <div className="view-post">
                {/* <div className="post-datas">
                        <div className="card-deck"> */}
                {loading ? (
                  <Loader></Loader>
                ) : (
                  <div className="row" id="session-data">

                    {postData ?
                      Object.entries(postData).sort((a, b) => a[1].postPositionNo - b[1].postPositionNo).map((item) => (

                        <ProductsData
                          key={item[0]}
                          id={item[0]}
                          postTopicName={item[1].postTopicName}
                          postImage={item[1].postImage}
                          postLongDetail={item[1].postLongDetail}
                          postTimestamp={item[1].postTimestamp}
                          onClickhandleDelete={(e) => handleDelete(item[0], e)}
                          postIsActiveStatus={item[1].postIsActiveStatus}
                          postIsEventStatus={item[1].postIsEventStatus}
                          onClickhandleEdit={(e) =>
                            handleEdit(
                              item[1].postTopicName,
                              item[1].postImage,
                              item[1].postLongDetail,
                              item[1].postPositionNo,
                              item[1].postIsActiveStatus,
                              item[1].postIsEventStatus,
                              item[0],
                              e
                            )}
                        />
                      )) :
                      <div className="row justify-content-center pt-4">
                        <div className="col-lg-12">
                          <div className="noprogramAdded text-center bg-white border shadow p-5">
                            <h2 className="noTaskAdded">Coming Soon</h2>
                            <span>We'll notify you as soon as something becomes available.</span>
                          </div>
                        </div>
                      </div>}
                  </div>
                )}
              </div>



            </div>
          </div>
        </div>

      </div>
    </>
  );

}

export default Products;
