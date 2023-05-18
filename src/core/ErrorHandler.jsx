import React from "react";

export function ErrorHandler(props) {
    const { error, handleReload, children } = props;
    if (error) {
      return (
        <>
          An error occurred while loading data. Click "Use Mocks" on top if you
          would like to test the app offline
          <div onClick={handleReload}>Reload</div>
        </>
      );
    } else {
      return children;
    }
  }
  