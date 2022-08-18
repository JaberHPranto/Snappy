const CreateRoomForm = () => {
  return (
    <form className="form col-md-12 mt-5">
      <div className="form-group">
        <input
          type="text"
          className="form-control my-2"
          placeholder="Enter your name"
        />
      </div>
      <div className="form-group ">
        <div className="input-group d-flex align-items-center justify-content-center">
          <input
            type="text"
            className="form-control my-2"
            placeholder="Generate room code"
          />
          <div className="input-group-append">
            <button className="btn btn-primary btn-sm" type="button">
              generate
            </button>
            <button className="btn btn-outline-danger btn-sm">copy</button>
          </div>
        </div>
      </div>
      <button
        className="mt-4 btn btn-primary btn-block form-control"
        type="submit"
      >
        Generate Room
      </button>
    </form>
  );
};

export default CreateRoomForm;
