import React, { useContext, useState } from 'react';
import { SharedData } from '../SharedData/SharedContext';
import toast from 'react-hot-toast';
import { serverUrl } from '../CustomHook/Server/Server';

const OptionModal = () => {
    const { user, logout, updateProfilePhoto,setLoading } = useContext(SharedData);
    const [tempPhoto, setTempPhoto] = useState(null);
    const handleImgChange = (e) => {
        const type = e.target.files[0].type;
        if (type.split('/')[1].toLowerCase() === 'png' || type.split('/')[1].toLowerCase() === 'jpg' || type.split('/')[1].toLowerCase() === "jpeg") {
            setTempPhoto(e.target.files[0]);
        }
        else {
            toast.error("File should be in png, jpg or jpeg format only");
            return;
        }
    }
    const handleSave = () => {
        const formData = new FormData();
        formData.append('image', tempPhoto);
        fetch(`https://api.imgbb.com/1/upload?key=${process.env.REACT_APP_imgBB}`, {
            method: "POST",
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                if(data.success){
                    updateProfilePhoto(data.data.url)
                    .then(()=>{
                        setLoading(false);
                        fetch(`${serverUrl}/user?user=${user?.email}`,{
                            method: "PUT",
                            headers:{
                                "content-type": "application/json",
                            },
                            body: JSON.stringify({profilePicture: data.data.url})
                        })
                        .then(res=>res.json())
                        .then(data=>{
                            if(data.modifiedCount>=1){
                                setTempPhoto(null);
                            }
                        })
                    })
                }
            })
    }
    return (
        <div className='modal fade' id='OptionModal' data-bs-keyboard="false" data-bs-backdrop="static">
            <div className="modal-dialog modal-sm modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header" style={{ borderBottom: "0px" }}>
                        <button className='btn btn-close' data-bs-dismiss="modal"></button>
                    </div>
                    <div className="modal-body">
                        <div className='d-flex justify-content-center'>
                            <div style={{ height: "140px", width: "140px" }}>
                                <img src={tempPhoto ? URL.createObjectURL(tempPhoto) : user?.photoURL} alt="" style={{ height: "100%", width: "100%", borderRadius: "50%" }} onClick={() => document.querySelector("#uploadImg").click()} />
                            </div>

                        </div>
                        <div className='d-flex justify-content-center mt-3'>
                            {
                                tempPhoto && <div >
                                    <button className='btn btn-success mx-2' style={{ width: "120px" }} onClick={handleSave} data-bs-dismiss="modal">Save</button>
                                    <button className='btn btn-danger' style={{ width: "120px" }} onClick={() => setTempPhoto(null)}>Cancel</button>
                                </div>
                            }
                        </div>
                        <input type="file" name='uploadImg' id='uploadImg' hidden onChange={handleImgChange} />
                        <div className='d-flex justify-content-center mt-2'>
                            <button className='btn btn-success' data-bs-dismiss="modal" onClick={() => logout()}>Logout</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OptionModal;