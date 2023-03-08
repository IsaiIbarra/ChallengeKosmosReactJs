import React, { useRef, useState, useEffect } from 'react';
import Moveable from 'react-moveable';

const App = () => {
  const [moveableComponents, setMoveableComponents] = useState([]);
  const [selected, setSelected] = useState(null);

  const removeMoveable = (id) => {
    let moveables = structuredClone(moveableComponents);

    let index = moveables.map((item, i) => {
      if (item.id === id) {
        return moveables.splice(i, 1);
      }
    });

    setMoveableComponents(moveables);
  };

  const addMoveable = (image) => {
    // Create a new moveable component and add it to the array
    const COLORS = ['red', 'blue', 'yellow', 'green', 'purple'];

    setMoveableComponents([
      ...moveableComponents,
      {
        id: Math.floor(Math.random() * Date.now()),
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        updateEnd: true,
        image: image,
      },
    ]);
  };

  const updateMoveable = (id, newComponent, updateEnd = false) => {
    const updatedMoveables = moveableComponents.map((moveable, i) => {
      if (moveable.id === id) {
        return { id, ...newComponent, updateEnd };
      }
      return moveable;
    });
    setMoveableComponents(updatedMoveables);
  };

  const handleResizeStart = (index, e) => {
    console.log('e', e.direction);
    // Check if the resize is coming from the left handle
    const [handlePosX, handlePosY] = e.direction;
    // 0 => center
    // -1 => top or left
    // 1 => bottom or right

    // -1, -1
    // -1, 0
    // -1, 1
    if (handlePosX === -1) {
      console.log('width', moveableComponents, e);
      // Save the initial left and width values of the moveable component
      const initialLeft = e.left;
      const initialWidth = e.width;

      // Set up the onResize event handler to update the left value based on the change in width
    }
  };

  const getPhotos = async () => {
    let random = Math.floor(Math.random() * 5000);

    await fetch(`https://jsonplaceholder.typicode.com/photos?id=${random}`, {
      method: 'GET',
    })
      .then((response) => response.json())
      .then((resp) => {
        return addMoveable(resp[0].url);
      });
  };

  return (
    <main style={{ height: '100vh', width: '100vw' }}>
      <button onClick={getPhotos}>Add Moveable1</button>
      <div
        id='parent'
        style={{
          position: 'relative',
          background: 'black',
          height: '80vh',
          width: '80vw',
          margin: 0,
          padding: 0,
          border: 0,
        }}
      >
        {moveableComponents.map((item, index) => (
          <Component
            {...item}
            key={index}
            updateMoveable={updateMoveable}
            removeMoveable={removeMoveable}
            handleResizeStart={handleResizeStart}
            setSelected={setSelected}
            isSelected={selected === item.id}
          />
        ))}
      </div>
    </main>
  );
};

export default App;

const Component = ({
  updateMoveable,
  removeMoveable,
  top,
  left,
  width,
  height,
  index,
  color,
  image,
  id,
  setSelected,
  isSelected = false,
  updateEnd,
}) => {
  const ref = useRef();

  const [nodoReferencia, setNodoReferencia] = useState({
    top,
    left,
    width,
    height,
    index,
    color,
    id,
  });

  let parent = document.getElementById('parent');
  let parentBounds = parent?.getBoundingClientRect();

  const onResize = async (e) => {
    const singleTranslate = e.drag.translate;
    // ACTUALIZAR ALTO Y ANCHO
    let newWidth = e.width;
    let newHeight = e.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    updateMoveable(id, {
      top: top + singleTranslate[1],
      left: left + singleTranslate[0],
      width: newWidth,
      height: newHeight,
      color,
      image,
    });

    // ACTUALIZAR NODO REFERENCIA
    const beforeTranslate = e.drag.beforeTranslate;

    ref.current.style.width = `${e.width}px`;
    ref.current.style.height = `${e.height}px`;

    let translateX = beforeTranslate[0];
    let translateY = beforeTranslate[1];

    ref.current.style.transform = `translate(${translateX}px, ${translateY}px)`;

    setNodoReferencia({
      ...nodoReferencia,
      translateX,
      translateY,
      top: top + translateY < 0 ? 0 : top + translateY,
      left: left + translateX < 0 ? 0 : left + translateX,
    });
  };

  const onResizeEnd = async (e) => {
    const singleTranslate = e.drag.translate;

    let newWidth = e.lastEvent?.width;
    let newHeight = e.lastEvent?.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    const { lastEvent } = e;
    const { drag } = lastEvent;
    const { beforeTranslate } = drag;

    const absoluteTop = top + beforeTranslate[1];
    const absoluteLeft = left + beforeTranslate[0];

    updateMoveable(
      id,
      {
        top: absoluteTop,
        left: absoluteLeft,
        width: newWidth,
        height: newHeight,
        color,
        image,
      },
      true
    );
  };

  return (
    <>
      <div
        ref={ref}
        className='draggable'
        id={'component-' + id}
        style={{
          position: 'absolute',
          top: top,
          left: left,
          width: width,
          height: height,
          // background: color,
          backgroundImage: `url(${image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        onClick={() => setSelected(id)}
      >
        <button
          onClick={() => {
            removeMoveable(id);
          }}
        >
          remove
        </button>
      </div>

      <Moveable
        target={isSelected && ref.current}
        resizable
        draggable
        onDrag={(e) => {
          if (
            e.top > 0 &&
            e.left > 0 &&
            e.left + e.width < parentBounds.right - parentBounds.left &&
            e.top + e.height < parentBounds.bottom - parentBounds.top
          ) {
            updateMoveable(id, {
              top: e.top,
              left: e.left,
              width,
              height,
              color,
              image,
            });
          }
        }}
        onResize={onResize}
        onResizeEnd={onResizeEnd}
        keepRatio={false}
        throttleResize={1}
        renderDirections={['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se']}
        edge={false}
        zoom={1}
        origin={false}
        padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
      />
    </>
  );
};
