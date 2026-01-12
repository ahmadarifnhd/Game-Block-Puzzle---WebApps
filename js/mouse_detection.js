let cursor = {
    x: 0,
    y: 0
}

let hover = {
    id: 0,
    name: ""
}

const updateCursorPosition = (clientX, clientY) => {
    const canvasRect = canvas.getBoundingClientRect()

    // Calculate scale ratio between rendered canvas size and actual canvas size
    const scaleX = canvas.width / canvasRect.width
    const scaleY = canvas.height / canvasRect.height

    cursor = {
        x: Math.round((clientX - canvasRect.left) * scaleX),
        y: Math.round((clientY - canvasRect.top) * scaleY)
    }

    // Reset hover first
    hover = { id: 0, name: "" }

    let objects_hover = []
    // Get list of visible objects by their key names
    const objectList = Object.keys(objects).filter(key => {
        const obj = objects[key]
        // Check if object has hide property and if it's not explicitly hidden
        return !obj.hasOwnProperty('hide') || obj.hide !== true
    })

    for (let key of objectList) {
        const obj = objects[key]
        // Skip if object doesn't have position/size properties
        if (!obj.hasOwnProperty('x') || !obj.hasOwnProperty('y') || !obj.hasOwnProperty('width') || !obj.hasOwnProperty('height')) {
            continue
        }

        const { x, y, width, height } = obj

        if (x < cursor.x && cursor.x < x + width && y < cursor.y && cursor.y < y + height) {
            objects_hover.push(key)
        }
    }

    // Set hover to the topmost object (last in the list if multiple overlap)
    if (objects_hover.length > 0) {
        hover = {
            id: objects_hover.length - 1,
            name: objects_hover[objects_hover.length - 1]
        }
    }
}

let listeners = {
    mousemove: (e) => {
        updateCursorPosition(e.clientX, e.clientY)
    },
    touchstart: (e) => {
        e.preventDefault()
        if (e.touches.length > 0) {
            const touch = e.touches[0]
            updateCursorPosition(touch.clientX, touch.clientY)
            // Trigger mousedown action immediately after updating position
            if (objects[hover.name] && objects[hover.name].hasOwnProperty("mousedown")) {
                objects[hover.name]["mousedown"]()
            }
        }
    },
    touchmove: (e) => {
        e.preventDefault()
        if (e.touches.length > 0) {
            const touch = e.touches[0]
            updateCursorPosition(touch.clientX, touch.clientY)
        }
    }
}

const actions = [
    "mousedown",
    "mouseup",
    "touchend"
]

actions.forEach((action) => {
    listeners[action] = (e) => {
        if (action === "touchend") {
            e.preventDefault()
        }
        const methodName = action.replace("touch", "mouse")
        if (objects[hover.name] && objects[hover.name].hasOwnProperty(methodName)) {
            objects[hover.name][methodName]()
        }
    }
})

Object.keys(listeners).forEach((listener) => {
    canvas.addEventListener(listener, (e) => {
        listeners[listener](e)
    })
})
