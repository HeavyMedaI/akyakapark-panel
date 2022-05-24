import React, { useState, useEffect } from "react"
import { Card, CardHeader, CardBody, CardTitle, Button } from "reactstrap"
import { useDropzone } from "react-dropzone"
import "../../../assets/scss/plugins/extensions/dropzone.scss"

function BasicDropzone(props) {
  const [files, setFiles] = useState([])
  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*",
    onDrop: acceptedFiles => {
        handleImage(acceptedFiles[0])
        setFiles(
            acceptedFiles.map(file =>
            Object.assign(file, {
                preview: URL.createObjectURL(file)
            })
            )
        )
    }
  })


 function handleImage(e) {
    var file = e;
    var reader = new FileReader();
    reader.onload = (e) => {
        var img = document.createElement("img");
        img.onload = () => {
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            var MAX_WIDTH = 1200;
            var MAX_HEIGHT = 1200;
            var width = img.width;
            var height = img.height;
            if (width > height) {
            if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
            }
            } else {
            if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
            }
            }
            canvas.width = width;
            canvas.height = height;
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);
            var dataurl = canvas.toDataURL("image/png");
            props.onAddImage(dataurl)
        }
        img.src = e.target.result;
    }
    reader.readAsDataURL(file);
}

    

  const thumbs = props.base64.map((file, index) => (
    <div className="dz-thumb" key={index} style={{ width: 'inherit', height: 'inherit' }}>
      <div className="dz-thumb-inner">
        <img src={file} style={{ width: '150px', height: 'auto' }} alt="thumb" />
      </div>
      <Button.Ripple 
        onClick={() => { 

          let a = files;
          a.splice(index, 1);

          props.onRemoveImage(index); setFiles(a) 
        }}
        color="danger" size="sm">
          Kaldır
      </Button.Ripple>
    </div>
  ))

  useEffect(
    () => () => {
      // Make sure to revoke the data uris to avoid memory leaks
      files.forEach(file => URL.revokeObjectURL(file.preview))
    },
    [files]
  )

  return (
    <section>
        {
        props.base64.length == 0 ?
        <>
        <div {...getRootProps({ className: "dropzone" })}>
            <input {...getInputProps()} />
            <p className="mx-1" style={props.error ? {color: 'red'} : {}}>
            {props.subTitle}
            </p>
        </div>        
        </>
        :
        null
        }
        <aside className="thumb-container">{thumbs}</aside>
    </section>
  )
}

class DropzoneBasic extends React.Component {

  static defaultProps = {
    title: "Resim",
    subTitle: "Resim seçmek için buraya tıklayın.",
    error: false,
    errorMessage: ""
  }

  render() {

    const { title, subTitle, error, errorMessage } = this.props

    return (
      <Card style={{ backgroundColor: '#efefef' }}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardBody>
          <BasicDropzone onAddImage={this.props.onAddImage} onRemoveImage={this.props.onRemoveImage} base64={this.props.base64} error={error} subTitle={error ? errorMessage : subTitle} />
        </CardBody>
      </Card>
    )
  }
}

export default DropzoneBasic
