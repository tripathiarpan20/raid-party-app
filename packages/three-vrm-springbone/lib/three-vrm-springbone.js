/*!
 * @pixiv/three-vrm-springbone v1.0.0
 * Spring bone module for @pixiv/three-vrm
 *
 * Copyright (c) 2020-2021 pixiv Inc.
 * @pixiv/three-vrm-springbone is distributed under MIT License
 * https://github.com/pixiv/three-vrm/blob/release/LICENSE
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('three')) :
    typeof define === 'function' && define.amd ? define(['exports', 'three'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.THREE_VRM_SPRINGBONE = {}, global.THREE));
})(this, (function (exports, THREE) { 'use strict';

    function _interopNamespace(e) {
        if (e && e.__esModule) return e;
        var n = Object.create(null);
        if (e) {
            Object.keys(e).forEach(function (k) {
                if (k !== 'default') {
                    var d = Object.getOwnPropertyDescriptor(e, k);
                    Object.defineProperty(n, k, d.get ? d : {
                        enumerable: true,
                        get: function () { return e[k]; }
                    });
                }
            });
        }
        n["default"] = e;
        return Object.freeze(n);
    }

    var THREE__namespace = /*#__PURE__*/_interopNamespace(THREE);

    /**
     * Represents a shape of a collider.
     */
    class VRMSpringBoneColliderShape {
    }

    const _v3A$1 = new THREE__namespace.Vector3();
    const _v3B$1 = new THREE__namespace.Vector3();
    class VRMSpringBoneColliderShapeCapsule extends VRMSpringBoneColliderShape {
        constructor(params) {
            var _a, _b, _c;
            super();
            this.offset = (_a = params === null || params === void 0 ? void 0 : params.offset) !== null && _a !== void 0 ? _a : new THREE__namespace.Vector3(0.0, 0.0, 0.0);
            this.tail = (_b = params === null || params === void 0 ? void 0 : params.tail) !== null && _b !== void 0 ? _b : new THREE__namespace.Vector3(0.0, 0.0, 0.0);
            this.radius = (_c = params === null || params === void 0 ? void 0 : params.radius) !== null && _c !== void 0 ? _c : 0.0;
        }
        get type() {
            return 'capsule';
        }
        calculateCollision(colliderMatrix, objectPosition, objectRadius, target) {
            _v3A$1.copy(this.offset).applyMatrix4(colliderMatrix); // transformed head
            _v3B$1.copy(this.tail).applyMatrix4(colliderMatrix); // transformed tail
            _v3B$1.sub(_v3A$1); // from head to tail
            const lengthSqCapsule = _v3B$1.lengthSq();
            target.copy(objectPosition).sub(_v3A$1); // from head to object
            const dot = _v3B$1.dot(target); // dot product of offsetToTail and offsetToObject
            if (dot <= 0.0) ;
            else if (lengthSqCapsule <= dot) {
                // if object is near from the tail
                target.sub(_v3B$1); // from tail to object
            }
            else {
                // if object is between two ends
                _v3B$1.multiplyScalar(dot / lengthSqCapsule); // from head to the nearest point of the shaft
                target.sub(_v3B$1); // from the shaft point to object
            }
            const radius = objectRadius + this.radius;
            const distance = target.length() - radius;
            target.normalize();
            return distance;
        }
    }

    class VRMSpringBoneColliderShapeSphere extends VRMSpringBoneColliderShape {
        constructor(params) {
            var _a, _b;
            super();
            this.offset = (_a = params === null || params === void 0 ? void 0 : params.offset) !== null && _a !== void 0 ? _a : new THREE__namespace.Vector3(0.0, 0.0, 0.0);
            this.radius = (_b = params === null || params === void 0 ? void 0 : params.radius) !== null && _b !== void 0 ? _b : 0.0;
        }
        get type() {
            return 'sphere';
        }
        calculateCollision(colliderMatrix, objectPosition, objectRadius, target) {
            target.copy(this.offset).applyMatrix4(colliderMatrix); // transformed offset
            target.negate().add(objectPosition); // a vector from collider center to object position
            const radius = objectRadius + this.radius;
            const distance = target.length() - radius;
            target.normalize();
            return distance;
        }
    }

    const _vecA = new THREE__namespace.Vector3();
    class ColliderShapeCapsuleBufferGeometry extends THREE__namespace.BufferGeometry {
        constructor(shape) {
            super();
            this._currentRadius = 0;
            this._currentOffset = new THREE__namespace.Vector3();
            this._currentTail = new THREE__namespace.Vector3();
            this._shape = shape;
            this._attrPos = new THREE__namespace.BufferAttribute(new Float32Array(396), 3);
            this.setAttribute('position', this._attrPos);
            this._attrIndex = new THREE__namespace.BufferAttribute(new Uint16Array(264), 1);
            this.setIndex(this._attrIndex);
            this._buildIndex();
            this.update();
        }
        update() {
            let shouldUpdateGeometry = false;
            if (this._currentRadius !== this._shape.radius) {
                this._currentRadius = this._shape.radius;
                shouldUpdateGeometry = true;
            }
            if (!this._currentOffset.equals(this._shape.offset)) {
                this._currentOffset.copy(this._shape.offset);
                shouldUpdateGeometry = true;
            }
            if (!this._currentTail.equals(this._shape.tail)) {
                this._currentTail.copy(this._shape.tail);
                shouldUpdateGeometry = true;
            }
            if (shouldUpdateGeometry) {
                this._buildPosition();
            }
        }
        _buildPosition() {
            _vecA.copy(this._currentTail).sub(this._currentOffset);
            const l = _vecA.length() / this._currentRadius;
            for (let i = 0; i <= 16; i++) {
                const t = (i / 16.0) * Math.PI;
                this._attrPos.setXYZ(i, -Math.sin(t), -Math.cos(t), 0.0);
                this._attrPos.setXYZ(17 + i, l + Math.sin(t), Math.cos(t), 0.0);
                this._attrPos.setXYZ(34 + i, -Math.sin(t), 0.0, -Math.cos(t));
                this._attrPos.setXYZ(51 + i, l + Math.sin(t), 0.0, Math.cos(t));
            }
            for (let i = 0; i < 32; i++) {
                const t = (i / 16.0) * Math.PI;
                this._attrPos.setXYZ(68 + i, 0.0, Math.sin(t), Math.cos(t));
                this._attrPos.setXYZ(100 + i, l, Math.sin(t), Math.cos(t));
            }
            const theta = Math.atan2(_vecA.y, Math.sqrt(_vecA.x * _vecA.x + _vecA.z * _vecA.z));
            const phi = -Math.atan2(_vecA.z, _vecA.x);
            this.rotateZ(theta);
            this.rotateY(phi);
            this.scale(this._currentRadius, this._currentRadius, this._currentRadius);
            this.translate(this._currentOffset.x, this._currentOffset.y, this._currentOffset.z);
            this._attrPos.needsUpdate = true;
        }
        _buildIndex() {
            for (let i = 0; i < 34; i++) {
                const i1 = (i + 1) % 34;
                this._attrIndex.setXY(i * 2, i, i1);
                this._attrIndex.setXY(68 + i * 2, 34 + i, 34 + i1);
            }
            for (let i = 0; i < 32; i++) {
                const i1 = (i + 1) % 32;
                this._attrIndex.setXY(136 + i * 2, 68 + i, 68 + i1);
                this._attrIndex.setXY(200 + i * 2, 100 + i, 100 + i1);
            }
            this._attrIndex.needsUpdate = true;
        }
    }

    class ColliderShapeSphereBufferGeometry extends THREE__namespace.BufferGeometry {
        constructor(shape) {
            super();
            this._currentRadius = 0;
            this._currentOffset = new THREE__namespace.Vector3();
            this._shape = shape;
            this._attrPos = new THREE__namespace.BufferAttribute(new Float32Array(32 * 3 * 3), 3);
            this.setAttribute('position', this._attrPos);
            this._attrIndex = new THREE__namespace.BufferAttribute(new Uint16Array(64 * 3), 1);
            this.setIndex(this._attrIndex);
            this._buildIndex();
            this.update();
        }
        update() {
            let shouldUpdateGeometry = false;
            if (this._currentRadius !== this._shape.radius) {
                this._currentRadius = this._shape.radius;
                shouldUpdateGeometry = true;
            }
            if (!this._currentOffset.equals(this._shape.offset)) {
                this._currentOffset.copy(this._shape.offset);
                shouldUpdateGeometry = true;
            }
            if (shouldUpdateGeometry) {
                this._buildPosition();
            }
        }
        _buildPosition() {
            for (let i = 0; i < 32; i++) {
                const t = (i / 16.0) * Math.PI;
                this._attrPos.setXYZ(i, Math.cos(t), Math.sin(t), 0.0);
                this._attrPos.setXYZ(32 + i, 0.0, Math.cos(t), Math.sin(t));
                this._attrPos.setXYZ(64 + i, Math.sin(t), 0.0, Math.cos(t));
            }
            this.scale(this._currentRadius, this._currentRadius, this._currentRadius);
            this.translate(this._currentOffset.x, this._currentOffset.y, this._currentOffset.z);
            this._attrPos.needsUpdate = true;
        }
        _buildIndex() {
            for (let i = 0; i < 32; i++) {
                const i1 = (i + 1) % 32;
                this._attrIndex.setXY(i * 2, i, i1);
                this._attrIndex.setXY(64 + i * 2, 32 + i, 32 + i1);
                this._attrIndex.setXY(128 + i * 2, 64 + i, 64 + i1);
            }
            this._attrIndex.needsUpdate = true;
        }
    }

    class VRMSpringBoneColliderHelper extends THREE__namespace.Group {
        constructor(collider) {
            super();
            this.matrixAutoUpdate = false;
            this.collider = collider;
            if (this.collider.shape instanceof VRMSpringBoneColliderShapeSphere) {
                this._geometry = new ColliderShapeSphereBufferGeometry(this.collider.shape);
            }
            else if (this.collider.shape instanceof VRMSpringBoneColliderShapeCapsule) {
                this._geometry = new ColliderShapeCapsuleBufferGeometry(this.collider.shape);
            }
            else {
                throw new Error('VRMSpringBoneColliderHelper: Unknown collider shape type detected');
            }
            const material = new THREE__namespace.LineBasicMaterial({
                color: 0xff00ff,
                depthTest: false,
                depthWrite: false,
            });
            this._line = new THREE__namespace.LineSegments(this._geometry, material);
            this.add(this._line);
        }
        dispose() {
            this._geometry.dispose();
        }
        updateMatrixWorld(force) {
            this.collider.updateWorldMatrix(true, false);
            this.matrix.copy(this.collider.matrixWorld);
            this._geometry.update();
            super.updateMatrixWorld(force);
        }
    }

    class SpringBoneBufferGeometry extends THREE__namespace.BufferGeometry {
        constructor(springBone) {
            super();
            this._currentRadius = 0;
            this._currentTail = new THREE__namespace.Vector3();
            this._springBone = springBone;
            this._attrPos = new THREE__namespace.BufferAttribute(new Float32Array(294), 3);
            this.setAttribute('position', this._attrPos);
            this._attrIndex = new THREE__namespace.BufferAttribute(new Uint16Array(194), 1);
            this.setIndex(this._attrIndex);
            this._buildIndex();
            this.update();
        }
        update() {
            let shouldUpdateGeometry = false;
            if (this._currentRadius !== this._springBone.settings.hitRadius) {
                this._currentRadius = this._springBone.settings.hitRadius;
                shouldUpdateGeometry = true;
            }
            if (!this._currentTail.equals(this._springBone.initialLocalChildPosition)) {
                this._currentTail.copy(this._springBone.initialLocalChildPosition);
                shouldUpdateGeometry = true;
            }
            if (shouldUpdateGeometry) {
                this._buildPosition();
            }
        }
        _buildPosition() {
            for (let i = 0; i < 32; i++) {
                const t = (i / 16.0) * Math.PI;
                this._attrPos.setXYZ(i, Math.cos(t), Math.sin(t), 0.0);
                this._attrPos.setXYZ(32 + i, 0.0, Math.cos(t), Math.sin(t));
                this._attrPos.setXYZ(64 + i, Math.sin(t), 0.0, Math.cos(t));
            }
            this.scale(this._currentRadius, this._currentRadius, this._currentRadius);
            this.translate(this._currentTail.x, this._currentTail.y, this._currentTail.z);
            this._attrPos.setXYZ(96, 0, 0, 0);
            this._attrPos.setXYZ(97, this._currentTail.x, this._currentTail.y, this._currentTail.z);
            this._attrPos.needsUpdate = true;
        }
        _buildIndex() {
            for (let i = 0; i < 32; i++) {
                const i1 = (i + 1) % 32;
                this._attrIndex.setXY(i * 2, i, i1);
                this._attrIndex.setXY(64 + i * 2, 32 + i, 32 + i1);
                this._attrIndex.setXY(128 + i * 2, 64 + i, 64 + i1);
            }
            this._attrIndex.setXY(192, 96, 97);
            this._attrIndex.needsUpdate = true;
        }
    }

    class VRMSpringBoneJointHelper extends THREE__namespace.Group {
        constructor(springBone) {
            super();
            this.matrixAutoUpdate = false;
            this.springBone = springBone;
            this._geometry = new SpringBoneBufferGeometry(this.springBone);
            const material = new THREE__namespace.LineBasicMaterial({
                color: 0xffff00,
                depthTest: false,
                depthWrite: false,
            });
            this._line = new THREE__namespace.LineSegments(this._geometry, material);
            this.add(this._line);
        }
        dispose() {
            this._geometry.dispose();
        }
        updateMatrixWorld(force) {
            this.springBone.bone.updateWorldMatrix(true, false);
            this.matrix.copy(this.springBone.bone.matrixWorld);
            this._geometry.update();
            super.updateMatrixWorld(force);
        }
    }

    /**
     * Represents a collider of a VRM.
     */
    class VRMSpringBoneCollider extends THREE__namespace.Object3D {
        constructor(shape) {
            super();
            this.shape = shape;
        }
    }

    const _matA$1 = new THREE__namespace.Matrix4();
    /**
     * A compat function for `Matrix4.invert()` / `Matrix4.getInverse()`.
     * `Matrix4.invert()` is introduced in r123 and `Matrix4.getInverse()` emits a warning.
     * We are going to use this compat for a while.
     * @param target A target matrix
     */
    function mat4InvertCompat(target) {
        if (target.invert) {
            target.invert();
        }
        else {
            target.getInverse(_matA$1.copy(target));
        }
        return target;
    }

    class Matrix4InverseCache {
        constructor(matrix) {
            /**
             * A cache of inverse of current matrix.
             */
            this._inverseCache = new THREE__namespace.Matrix4();
            /**
             * A flag that makes it want to recalculate its {@link _inverseCache}.
             * Will be set `true` when `elements` are mutated and be used in `getInverse`.
             */
            this._shouldUpdateInverse = true;
            this.matrix = matrix;
            const handler = {
                //@ts-ignore
                set: (obj, prop, newVal) => {
                    this._shouldUpdateInverse = true;
                    obj[prop] = newVal;
                    return true;
                },
            };
            this._originalElements = matrix.elements;
            matrix.elements = new Proxy(matrix.elements, handler);
        }
        /**
         * Inverse of given matrix.
         * Note that it will return its internal private instance.
         * Make sure copying this before mutate this.
         */
        get inverse() {
            if (this._shouldUpdateInverse) {
                this._inverseCache.copy(this.matrix);
                mat4InvertCompat(this._inverseCache);
                this._shouldUpdateInverse = false;
            }
            return this._inverseCache;
        }
        revert() {
            this.matrix.elements = this._originalElements;
        }
    }

    // based on
    // http://rocketjump.skr.jp/unity3d/109/
    // https://github.com/dwango/UniVRM/blob/master/Scripts/SpringBone/VRMSpringBone.cs
    const IDENTITY_MATRIX4 = new THREE__namespace.Matrix4();
    // 計算中の一時保存用変数（一度インスタンスを作ったらあとは使い回す）
    const _v3A = new THREE__namespace.Vector3();
    const _v3B = new THREE__namespace.Vector3();
    const _v3C = new THREE__namespace.Vector3();
    /**
     * A temporary variable which is used in `update`
     */
    const _worldSpacePosition = new THREE__namespace.Vector3();
    /**
     * A temporary variable which is used in `update`
     */
    const _centerSpacePosition = new THREE__namespace.Vector3();
    /**
     * A temporary variable which is used in `update`
     */
    const _nextTail = new THREE__namespace.Vector3();
    const _quatA = new THREE__namespace.Quaternion();
    const _matA = new THREE__namespace.Matrix4();
    const _matB = new THREE__namespace.Matrix4();
    /**
     * A class represents a single joint of a spring bone.
     * It should be managed by a [[VRMSpringBoneManager]].
     */
    class VRMSpringBoneJoint {
        /**
         * Create a new VRMSpringBone.
         *
         * @param bone An Object3D that will be attached to this bone
         * @param child An Object3D that will be used as a tail of this spring bone. It can be null when the spring bone is imported from VRM 0.0
         * @param settings Several parameters related to behavior of the spring bone
         * @param colliderGroups Collider groups that will be collided with this spring bone
         */
        constructor(bone, child, settings = {}, colliderGroups = []) {
            var _a, _b, _c, _d, _e, _f;
            /**
             * Current position of child tail, in center unit. Will be used for verlet integration.
             */
            this._currentTail = new THREE__namespace.Vector3();
            /**
             * Previous position of child tail, in center unit. Will be used for verlet integration.
             */
            this._prevTail = new THREE__namespace.Vector3();
            /**
             * Initial axis of the bone, in local unit.
             */
            this._boneAxis = new THREE__namespace.Vector3();
            /**
             * Length of the bone in world unit. Will be used for normalization in update loop.
             * It's same as local unit length unless there are scale transformations in the world space.
             */
            this._worldSpaceBoneLength = 0.0;
            /**
             * This springbone will be calculated based on the space relative from this object.
             * If this is `null`, springbone will be calculated in world space.
             */
            this._center = null;
            /**
             * Initial state of the local matrix of the bone.
             */
            this._initialLocalMatrix = new THREE__namespace.Matrix4();
            /**
             * Initial state of the rotation of the bone.
             */
            this._initialLocalRotation = new THREE__namespace.Quaternion();
            /**
             * Initial state of the position of its child.
             */
            this._initialLocalChildPosition = new THREE__namespace.Vector3();
            this.bone = bone; // uniVRMでの parent
            this.bone.matrixAutoUpdate = false; // updateにより計算されるのでthree.js内での自動処理は不要
            this.child = child;
            this.settings = {
                hitRadius: (_a = settings.hitRadius) !== null && _a !== void 0 ? _a : 0.0,
                stiffness: (_b = settings.stiffness) !== null && _b !== void 0 ? _b : 1.0,
                gravityPower: (_c = settings.gravityPower) !== null && _c !== void 0 ? _c : 0.0,
                gravityDir: (_e = (_d = settings.gravityDir) === null || _d === void 0 ? void 0 : _d.clone()) !== null && _e !== void 0 ? _e : new THREE__namespace.Vector3(0.0, -1.0, 0.0),
                dragForce: (_f = settings.dragForce) !== null && _f !== void 0 ? _f : 0.4,
            };
            this.colliderGroups = colliderGroups;
        }
        get center() {
            return this._center;
        }
        set center(center) {
            var _a;
            // uninstall inverse cache
            if ((_a = this._center) === null || _a === void 0 ? void 0 : _a.userData.inverseCacheProxy) {
                this._center.userData.inverseCacheProxy.revert();
                delete this._center.userData.inverseCacheProxy;
            }
            // change the center
            this._center = center;
            // install inverse cache
            if (this._center) {
                if (!this._center.userData.inverseCacheProxy) {
                    this._center.userData.inverseCacheProxy = new Matrix4InverseCache(this._center.matrixWorld);
                }
            }
        }
        get initialLocalChildPosition() {
            return this._initialLocalChildPosition;
        }
        /**
         * Returns the world matrix of its parent object.
         * Note that it returns a reference to the matrix. Don't mutate this directly!
         */
        get _parentMatrixWorld() {
            return this.bone.parent ? this.bone.parent.matrixWorld : IDENTITY_MATRIX4;
        }
        /**
         * Set the initial state of this spring bone.
         * You might want to call {@link VRMSpringBoneManager.setInitState} instead.
         */
        setInitState() {
            // remember initial position of itself
            this._initialLocalMatrix.copy(this.bone.matrix);
            this._initialLocalRotation.copy(this.bone.quaternion);
            // see initial position of its local child
            if (this.child) {
                this._initialLocalChildPosition.copy(this.child.position);
            }
            else {
                // vrm0 requires a 7cm fixed bone length for the final node in a chain
                // See: https://github.com/vrm-c/vrm-specification/tree/master/specification/VRMC_springBone-1.0#about-spring-configuration
                this._initialLocalChildPosition.copy(this.bone.position).normalize().multiplyScalar(0.07);
            }
            // copy the child position to tails
            this.bone.localToWorld(this._currentTail.copy(this._initialLocalChildPosition));
            this._prevTail.copy(this._currentTail);
            // set initial states that are related to local child position
            this._boneAxis.copy(this._initialLocalChildPosition).normalize();
            this._worldSpaceBoneLength = _v3A
                .copy(this._initialLocalChildPosition)
                .applyMatrix4(this.bone.matrixWorld)
                .sub(_v3B.setFromMatrixPosition(this.bone.matrixWorld))
                .length();
        }
        /**
         * Reset the state of this bone.
         * You might want to call [[VRMSpringBoneManager.reset]] instead.
         */
        reset() {
            this.bone.quaternion.copy(this._initialLocalRotation);
            // We need to update its matrixWorld manually, since we tweaked the bone by our hand
            this.bone.updateMatrix();
            this.bone.matrixWorld.multiplyMatrices(this._parentMatrixWorld, this.bone.matrix);
            // Apply updated position to tail states
            const matrixWorldToCenter = this._getMatrixWorldToCenter(_matA);
            this.bone.localToWorld(this._currentTail.copy(this._initialLocalChildPosition)).applyMatrix4(matrixWorldToCenter);
            this._prevTail.copy(this._currentTail);
        }
        /**
         * Update the state of this bone.
         * You might want to call [[VRMSpringBoneManager.update]] instead.
         *
         * @param delta deltaTime
         */
        update(delta) {
            if (delta <= 0)
                return;
            // Get bone position in center space
            _worldSpacePosition.setFromMatrixPosition(this.bone.matrixWorld);
            let matrixWorldToCenter = this._getMatrixWorldToCenter(_matA);
            _centerSpacePosition.copy(_worldSpacePosition).applyMatrix4(matrixWorldToCenter);
            const quatWorldToCenter = _quatA.setFromRotationMatrix(matrixWorldToCenter);
            // Get parent matrix in center space
            const centerSpaceParentMatrix = _matB.copy(matrixWorldToCenter).multiply(this._parentMatrixWorld);
            // Get boneAxis in center space
            const centerSpaceBoneAxis = _v3B
                .copy(this._boneAxis)
                .applyMatrix4(this._initialLocalMatrix)
                .applyMatrix4(centerSpaceParentMatrix)
                .sub(_centerSpacePosition)
                .normalize();
            // gravity in center space
            const centerSpaceGravity = _v3C.copy(this.settings.gravityDir).applyQuaternion(quatWorldToCenter).normalize();
            const matrixCenterToWorld = this._getMatrixCenterToWorld(_matA);
            // verlet積分で次の位置を計算
            _nextTail
                .copy(this._currentTail)
                .add(_v3A
                .copy(this._currentTail)
                .sub(this._prevTail)
                .multiplyScalar(1 - this.settings.dragForce)) // 前フレームの移動を継続する(減衰もあるよ)
                .add(_v3A.copy(centerSpaceBoneAxis).multiplyScalar(this.settings.stiffness * delta)) // 親の回転による子ボーンの移動目標
                .add(_v3A.copy(centerSpaceGravity).multiplyScalar(this.settings.gravityPower * delta)) // 外力による移動量
                .applyMatrix4(matrixCenterToWorld); // tailをworld spaceに戻す
            // normalize bone length
            _nextTail.sub(_worldSpacePosition).normalize().multiplyScalar(this._worldSpaceBoneLength).add(_worldSpacePosition);
            // Collisionで移動
            this._collision(_nextTail);
            // update prevTail and currentTail
            matrixWorldToCenter = this._getMatrixWorldToCenter(_matA);
            this._prevTail.copy(this._currentTail);
            this._currentTail.copy(_v3A.copy(_nextTail).applyMatrix4(matrixWorldToCenter));
            // Apply rotation, convert vector3 thing into actual quaternion
            // Original UniVRM is doing center unit calculus at here but we're gonna do this on local unit
            const worldSpaceInitialMatrixInv = mat4InvertCompat(_matA.copy(this._parentMatrixWorld).multiply(this._initialLocalMatrix));
            const applyRotation = _quatA.setFromUnitVectors(this._boneAxis, _v3A.copy(_nextTail).applyMatrix4(worldSpaceInitialMatrixInv).normalize());
            this.bone.quaternion.copy(this._initialLocalRotation).multiply(applyRotation);
            // We need to update its matrixWorld manually, since we tweaked the bone by our hand
            this.bone.updateMatrix();
            this.bone.matrixWorld.multiplyMatrices(this._parentMatrixWorld, this.bone.matrix);
        }
        /**
         * Do collision math against every colliders attached to this bone.
         *
         * @param tail The tail you want to process
         */
        _collision(tail) {
            this.colliderGroups.forEach((colliderGroup) => {
                colliderGroup.colliders.forEach((collider) => {
                    const dist = collider.shape.calculateCollision(collider.matrixWorld, tail, this.settings.hitRadius, _v3A);
                    if (dist < 0.0) {
                        // hit
                        tail.add(_v3A.multiplyScalar(-dist));
                        // normalize bone length
                        tail.sub(_worldSpacePosition).normalize().multiplyScalar(this._worldSpaceBoneLength).add(_worldSpacePosition);
                    }
                });
            });
        }
        /**
         * Create a matrix that converts center space into world space.
         * @param target Target matrix
         */
        _getMatrixCenterToWorld(target) {
            if (this._center) {
                target.copy(this._center.matrixWorld);
            }
            else {
                target.identity();
            }
            return target;
        }
        /**
         * Create a matrix that converts world space into center space.
         * @param target Target matrix
         */
        _getMatrixWorldToCenter(target) {
            if (this._center) {
                target.copy(this._center.userData.inverseCacheProxy.inverse);
            }
            else {
                target.identity();
            }
            return target;
        }
    }

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function traverseAncestorsFromRoot(object, callback) {
        const ancestors = [];
        let head = object;
        while (head !== null) {
            ancestors.unshift(head);
            head = head.parent;
        }
        ancestors.forEach((ancestor) => {
            callback(ancestor);
        });
    }

    /**
     * Traverse children of given object and execute given callback.
     * The given object itself wont be given to the callback.
     * If the return value of the callback is `true`, it will halt the traversal of its children.
     * @param object A root object
     * @param callback A callback function called for each children
     */
    function traverseChildrenUntilConditionMet(object, callback) {
        object.children.forEach((child) => {
            const result = callback(child);
            if (!result) {
                traverseChildrenUntilConditionMet(child, callback);
            }
        });
    }

    class VRMSpringBoneManager {
        constructor() {
            this._joints = new Set();
            this._objectSpringBonesMap = new Map();
        }
        get joints() {
            return this._joints;
        }
        /**
         * @deprecated Use {@link joints} instead.
         */
        get springBones() {
            console.warn('VRMSpringBoneManager: springBones is deprecated. use joints instead.');
            return this._joints;
        }
        get colliderGroups() {
            const set = new Set();
            this._joints.forEach((springBone) => {
                springBone.colliderGroups.forEach((colliderGroup) => {
                    set.add(colliderGroup);
                });
            });
            return Array.from(set);
        }
        get colliders() {
            const set = new Set();
            this.colliderGroups.forEach((colliderGroup) => {
                colliderGroup.colliders.forEach((collider) => {
                    set.add(collider);
                });
            });
            return Array.from(set);
        }
        addJoint(joint) {
            this._joints.add(joint);
            let objectSet = this._objectSpringBonesMap.get(joint.bone);
            if (objectSet == null) {
                objectSet = new Set();
                this._objectSpringBonesMap.set(joint.bone, objectSet);
            }
            objectSet.add(joint);
        }
        /**
         * @deprecated Use {@link addJoint} instead.
         */
        addSpringBone(joint) {
            console.warn('VRMSpringBoneManager: addSpringBone() is deprecated. use addJoint() instead.');
            this.addJoint(joint);
        }
        deleteJoint(joint) {
            this._joints.delete(joint);
            const objectSet = this._objectSpringBonesMap.get(joint.bone);
            objectSet.delete(joint);
        }
        /**
         * @deprecated Use {@link deleteJoint} instead.
         */
        deleteSpringBone(joint) {
            console.warn('VRMSpringBoneManager: deleteSpringBone() is deprecated. use deleteJoint() instead.');
            this.deleteJoint(joint);
        }
        setInitState() {
            const springBonesTried = new Set();
            const springBonesDone = new Set();
            const objectUpdated = new Set();
            for (const springBone of this._joints) {
                this._processSpringBone(springBone, springBonesTried, springBonesDone, objectUpdated, (springBone) => springBone.setInitState());
            }
        }
        reset() {
            const springBonesTried = new Set();
            const springBonesDone = new Set();
            const objectUpdated = new Set();
            for (const springBone of this._joints) {
                this._processSpringBone(springBone, springBonesTried, springBonesDone, objectUpdated, (springBone) => springBone.reset());
            }
        }
        update(delta) {
            const springBonesTried = new Set();
            const springBonesDone = new Set();
            const objectUpdated = new Set();
            for (const springBone of this._joints) {
                // update the springbone
                this._processSpringBone(springBone, springBonesTried, springBonesDone, objectUpdated, (springBone) => springBone.update(delta));
                // update children world matrices
                // it is required when the spring bone chain is sparse
                traverseChildrenUntilConditionMet(springBone.bone, (object) => {
                    var _a, _b;
                    // if the object has attached springbone, halt the traversal
                    if (((_b = (_a = this._objectSpringBonesMap.get(object)) === null || _a === void 0 ? void 0 : _a.size) !== null && _b !== void 0 ? _b : 0) > 0) {
                        return true;
                    }
                    // otherwise update its world matrix
                    object.updateWorldMatrix(false, false);
                    return false;
                });
            }
        }
        /**
         * Update a spring bone.
         * If there are other spring bone that are dependant, it will try to update them recursively.
         * It updates matrixWorld of all ancestors and myself.
         * It might throw an error if there are circular dependencies.
         *
         * Intended to be used in {@link update} and {@link _processSpringBone} itself recursively.
         *
         * @param springBone A springBone you want to update
         * @param springBonesTried Set of springBones that are already tried to be updated
         * @param springBonesDone Set of springBones that are already up to date
         * @param objectUpdated Set of object3D whose matrixWorld is updated
         */
        _processSpringBone(springBone, springBonesTried, springBonesDone, objectUpdated, callback) {
            if (springBonesDone.has(springBone)) {
                return;
            }
            if (springBonesTried.has(springBone)) {
                throw new Error('VRMSpringBoneManager: Circular dependency detected while updating springbones');
            }
            springBonesTried.add(springBone);
            const depObjects = this._getDependencies(springBone);
            for (const depObject of depObjects) {
                traverseAncestorsFromRoot(depObject, (depObjectAncestor) => {
                    const objectSet = this._objectSpringBonesMap.get(depObjectAncestor);
                    if (objectSet) {
                        for (const depSpringBone of objectSet) {
                            this._processSpringBone(depSpringBone, springBonesTried, springBonesDone, objectUpdated, callback);
                        }
                    }
                    else if (!objectUpdated.has(depObjectAncestor)) {
                        // update matrix of non-springbone
                        depObjectAncestor.updateWorldMatrix(false, false);
                        objectUpdated.add(depObjectAncestor);
                    }
                });
            }
            // update my matrix
            springBone.bone.updateMatrix();
            springBone.bone.updateWorldMatrix(false, false);
            callback(springBone);
            objectUpdated.add(springBone.bone);
            springBonesDone.add(springBone);
        }
        /**
         * Return a set of objects that are dependant of given spring bone.
         * @param springBone A spring bone
         * @return A set of objects that are dependant of given spring bone
         */
        _getDependencies(springBone) {
            const set = new Set();
            const parent = springBone.bone.parent;
            if (parent) {
                set.add(parent);
            }
            springBone.colliderGroups.forEach((colliderGroup) => {
                colliderGroup.colliders.forEach((collider) => {
                    set.add(collider);
                });
            });
            return set;
        }
    }

    /**
     * Possible spec versions it recognizes.
     */
    const POSSIBLE_SPEC_VERSIONS = new Set(['1.0', '1.0-beta']);
    class VRMSpringBoneLoaderPlugin {
        constructor(parser, options) {
            this.parser = parser;
            this.jointHelperRoot = options === null || options === void 0 ? void 0 : options.jointHelperRoot;
            this.colliderHelperRoot = options === null || options === void 0 ? void 0 : options.colliderHelperRoot;
        }
        get name() {
            return VRMSpringBoneLoaderPlugin.EXTENSION_NAME;
        }
        afterRoot(gltf) {
            return __awaiter(this, void 0, void 0, function* () {
                gltf.userData.vrmSpringBoneManager = yield this._import(gltf);
            });
        }
        /**
         * Import spring bones from a GLTF and return a {@link VRMSpringBoneManager}.
         * It might return `null` instead when it does not need to be created or something go wrong.
         *
         * @param gltf A parsed result of GLTF taken from GLTFLoader
         */
        _import(gltf) {
            return __awaiter(this, void 0, void 0, function* () {
                const v1Result = yield this._v1Import(gltf);
                if (v1Result != null) {
                    return v1Result;
                }
                const v0Result = yield this._v0Import(gltf);
                if (v0Result != null) {
                    return v0Result;
                }
                return null;
            });
        }
        _v1Import(gltf) {
            var _a, _b, _c, _d, _e;
            return __awaiter(this, void 0, void 0, function* () {
                const json = gltf.parser.json;
                // early abort if it doesn't use spring bones
                const isSpringBoneUsed = ((_a = json.extensionsUsed) === null || _a === void 0 ? void 0 : _a.indexOf(VRMSpringBoneLoaderPlugin.EXTENSION_NAME)) !== -1;
                if (!isSpringBoneUsed) {
                    return null;
                }
                const manager = new VRMSpringBoneManager();
                const threeNodes = yield gltf.parser.getDependencies('node');
                const extension = (_b = json.extensions) === null || _b === void 0 ? void 0 : _b[VRMSpringBoneLoaderPlugin.EXTENSION_NAME];
                if (!extension) {
                    return null;
                }
                const specVersion = extension.specVersion;
                if (!POSSIBLE_SPEC_VERSIONS.has(specVersion)) {
                    console.warn(`VRMSpringBoneLoaderPlugin: Unknown ${VRMSpringBoneLoaderPlugin.EXTENSION_NAME} specVersion "${specVersion}"`);
                    return null;
                }
                const colliders = (_c = extension.colliders) === null || _c === void 0 ? void 0 : _c.map((schemaCollider, iCollider) => {
                    var _a, _b, _c, _d, _e;
                    const node = threeNodes[schemaCollider.node];
                    const schemaShape = schemaCollider.shape;
                    if (schemaShape.sphere) {
                        return this._importSphereCollider(node, {
                            offset: new THREE__namespace.Vector3().fromArray((_a = schemaShape.sphere.offset) !== null && _a !== void 0 ? _a : [0.0, 0.0, 0.0]),
                            radius: (_b = schemaShape.sphere.radius) !== null && _b !== void 0 ? _b : 0.0,
                        });
                    }
                    else if (schemaShape.capsule) {
                        return this._importCapsuleCollider(node, {
                            offset: new THREE__namespace.Vector3().fromArray((_c = schemaShape.capsule.offset) !== null && _c !== void 0 ? _c : [0.0, 0.0, 0.0]),
                            radius: (_d = schemaShape.capsule.radius) !== null && _d !== void 0 ? _d : 0.0,
                            tail: new THREE__namespace.Vector3().fromArray((_e = schemaShape.capsule.tail) !== null && _e !== void 0 ? _e : [0.0, 0.0, 0.0]),
                        });
                    }
                    throw new Error(`VRMSpringBoneLoaderPlugin: The collider #${iCollider} has no valid shape`);
                });
                const colliderGroups = (_d = extension.colliderGroups) === null || _d === void 0 ? void 0 : _d.map((schemaColliderGroup, iColliderGroup) => {
                    var _a;
                    const cols = ((_a = schemaColliderGroup.colliders) !== null && _a !== void 0 ? _a : []).map((iCollider) => {
                        const col = colliders === null || colliders === void 0 ? void 0 : colliders[iCollider];
                        if (col == null) {
                            throw new Error(`VRMSpringBoneLoaderPlugin: The colliderGroup #${iColliderGroup} attempted to use a collider #${iCollider} but not found`);
                        }
                        return col;
                    });
                    return {
                        colliders: cols,
                        name: schemaColliderGroup.name,
                    };
                });
                (_e = extension.springs) === null || _e === void 0 ? void 0 : _e.forEach((schemaSpring, iSpring) => {
                    var _a;
                    const schemaJoints = schemaSpring.joints;
                    // prepare colliders
                    const colliderGroupsForSpring = (_a = schemaSpring.colliderGroups) === null || _a === void 0 ? void 0 : _a.map((iColliderGroup) => {
                        const group = colliderGroups === null || colliderGroups === void 0 ? void 0 : colliderGroups[iColliderGroup];
                        if (group == null) {
                            throw new Error(`VRMSpringBoneLoaderPlugin: The spring #${iSpring} attempted to use a colliderGroup ${iColliderGroup} but not found`);
                        }
                        return group;
                    });
                    const center = schemaSpring.center != null ? threeNodes[schemaSpring.center] : undefined;
                    let prevSchemaJoint;
                    schemaJoints.forEach((schemaJoint) => {
                        if (prevSchemaJoint) {
                            // prepare node
                            const nodeIndex = prevSchemaJoint.node;
                            const node = threeNodes[nodeIndex];
                            const childIndex = schemaJoint.node;
                            const child = threeNodes[childIndex];
                            // prepare setting
                            const setting = {
                                hitRadius: prevSchemaJoint.hitRadius,
                                dragForce: prevSchemaJoint.dragForce,
                                gravityPower: prevSchemaJoint.gravityPower,
                                stiffness: prevSchemaJoint.stiffness,
                                gravityDir: prevSchemaJoint.gravityDir != null
                                    ? new THREE__namespace.Vector3().fromArray(prevSchemaJoint.gravityDir)
                                    : undefined,
                            };
                            // create spring bones
                            const joint = this._importJoint(node, child, setting, colliderGroupsForSpring);
                            if (center) {
                                joint.center = center;
                            }
                            manager.addJoint(joint);
                        }
                        prevSchemaJoint = schemaJoint;
                    });
                });
                // init spring bones
                manager.setInitState();
                return manager;
            });
        }
        _v0Import(gltf) {
            var _a, _b, _c;
            return __awaiter(this, void 0, void 0, function* () {
                const json = gltf.parser.json;
                // early abort if it doesn't use vrm
                const isVRMUsed = ((_a = json.extensionsUsed) === null || _a === void 0 ? void 0 : _a.indexOf('VRM')) !== -1;
                if (!isVRMUsed) {
                    return null;
                }
                // early abort if it doesn't have bone groups
                const extension = (_b = json.extensions) === null || _b === void 0 ? void 0 : _b['VRM'];
                const schemaSecondaryAnimation = extension === null || extension === void 0 ? void 0 : extension.secondaryAnimation;
                if (!schemaSecondaryAnimation) {
                    return null;
                }
                const schemaBoneGroups = schemaSecondaryAnimation === null || schemaSecondaryAnimation === void 0 ? void 0 : schemaSecondaryAnimation.boneGroups;
                if (!schemaBoneGroups) {
                    return null;
                }
                const manager = new VRMSpringBoneManager();
                const threeNodes = yield gltf.parser.getDependencies('node');
                const colliderGroups = (_c = schemaSecondaryAnimation.colliderGroups) === null || _c === void 0 ? void 0 : _c.map((schemaColliderGroup) => {
                    var _a;
                    const node = threeNodes[schemaColliderGroup.node];
                    const colliders = ((_a = schemaColliderGroup.colliders) !== null && _a !== void 0 ? _a : []).map((schemaCollider, iCollider) => {
                        var _a, _b, _c;
                        const offset = new THREE__namespace.Vector3(0.0, 0.0, 0.0);
                        if (schemaCollider.offset) {
                            offset.set((_a = schemaCollider.offset.x) !== null && _a !== void 0 ? _a : 0.0, (_b = schemaCollider.offset.y) !== null && _b !== void 0 ? _b : 0.0, schemaCollider.offset.z ? -schemaCollider.offset.z : 0.0);
                        }
                        return this._importSphereCollider(node, {
                            offset,
                            radius: (_c = schemaCollider.radius) !== null && _c !== void 0 ? _c : 0.0,
                        });
                    });
                    return { colliders };
                });
                // import spring bones for each spring bone groups
                schemaBoneGroups === null || schemaBoneGroups === void 0 ? void 0 : schemaBoneGroups.forEach((schemaBoneGroup, iBoneGroup) => {
                    const rootIndices = schemaBoneGroup.bones;
                    if (!rootIndices) {
                        return;
                    }
                    rootIndices.forEach((rootIndex) => {
                        var _a, _b, _c, _d;
                        const root = threeNodes[rootIndex];
                        // prepare setting
                        const gravityDir = new THREE__namespace.Vector3();
                        if (schemaBoneGroup.gravityDir) {
                            gravityDir.set((_a = schemaBoneGroup.gravityDir.x) !== null && _a !== void 0 ? _a : 0.0, (_b = schemaBoneGroup.gravityDir.y) !== null && _b !== void 0 ? _b : 0.0, (_c = schemaBoneGroup.gravityDir.z) !== null && _c !== void 0 ? _c : 0.0);
                        }
                        else {
                            gravityDir.set(0.0, -1.0, 0.0);
                        }
                        const center = schemaBoneGroup.center != null ? threeNodes[schemaBoneGroup.center] : undefined;
                        const setting = {
                            hitRadius: schemaBoneGroup.hitRadius,
                            dragForce: schemaBoneGroup.dragForce,
                            gravityPower: schemaBoneGroup.gravityPower,
                            stiffness: schemaBoneGroup.stiffiness,
                            gravityDir,
                        };
                        // prepare colliders
                        const colliderGroupsForSpring = (_d = schemaBoneGroup.colliderGroups) === null || _d === void 0 ? void 0 : _d.map((iColliderGroup) => {
                            const group = colliderGroups === null || colliderGroups === void 0 ? void 0 : colliderGroups[iColliderGroup];
                            if (group == null) {
                                throw new Error(`VRMSpringBoneLoaderPlugin: The spring #${iBoneGroup} attempted to use a colliderGroup ${iColliderGroup} but not found`);
                            }
                            return group;
                        });
                        // create spring bones
                        root.traverse((node) => {
                            var _a;
                            const child = (_a = node.children[0]) !== null && _a !== void 0 ? _a : null;
                            const joint = this._importJoint(node, child, setting, colliderGroupsForSpring);
                            if (center) {
                                joint.center = center;
                            }
                            manager.addJoint(joint);
                        });
                    });
                });
                // init spring bones
                gltf.scene.updateMatrixWorld();
                manager.setInitState();
                return manager;
            });
        }
        _importJoint(node, child, setting, colliderGroupsForSpring) {
            const springBone = new VRMSpringBoneJoint(node, child, setting, colliderGroupsForSpring);
            if (this.jointHelperRoot) {
                const helper = new VRMSpringBoneJointHelper(springBone);
                this.jointHelperRoot.add(helper);
                helper.renderOrder = this.jointHelperRoot.renderOrder;
            }
            return springBone;
        }
        _importSphereCollider(destination, params) {
            const { offset, radius } = params;
            const shape = new VRMSpringBoneColliderShapeSphere({ offset, radius });
            const collider = new VRMSpringBoneCollider(shape);
            destination.add(collider);
            if (this.colliderHelperRoot) {
                const helper = new VRMSpringBoneColliderHelper(collider);
                this.colliderHelperRoot.add(helper);
                helper.renderOrder = this.colliderHelperRoot.renderOrder;
            }
            return collider;
        }
        _importCapsuleCollider(destination, params) {
            const { offset, radius, tail } = params;
            const shape = new VRMSpringBoneColliderShapeCapsule({ offset, radius, tail });
            const collider = new VRMSpringBoneCollider(shape);
            destination.add(collider);
            if (this.colliderHelperRoot) {
                const helper = new VRMSpringBoneColliderHelper(collider);
                this.colliderHelperRoot.add(helper);
                helper.renderOrder = this.colliderHelperRoot.renderOrder;
            }
            return collider;
        }
    }
    VRMSpringBoneLoaderPlugin.EXTENSION_NAME = 'VRMC_springBone';

    exports.VRMSpringBoneCollider = VRMSpringBoneCollider;
    exports.VRMSpringBoneColliderHelper = VRMSpringBoneColliderHelper;
    exports.VRMSpringBoneColliderShape = VRMSpringBoneColliderShape;
    exports.VRMSpringBoneColliderShapeCapsule = VRMSpringBoneColliderShapeCapsule;
    exports.VRMSpringBoneColliderShapeSphere = VRMSpringBoneColliderShapeSphere;
    exports.VRMSpringBoneJoint = VRMSpringBoneJoint;
    exports.VRMSpringBoneJointHelper = VRMSpringBoneJointHelper;
    exports.VRMSpringBoneLoaderPlugin = VRMSpringBoneLoaderPlugin;
    exports.VRMSpringBoneManager = VRMSpringBoneManager;

    Object.defineProperty(exports, '__esModule', { value: true });

    Object.assign(THREE, exports);

}));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhyZWUtdnJtLXNwcmluZ2JvbmUuanMiLCJzb3VyY2VzIjpbIi4uL3NyYy9WUk1TcHJpbmdCb25lQ29sbGlkZXJTaGFwZS50cyIsIi4uL3NyYy9WUk1TcHJpbmdCb25lQ29sbGlkZXJTaGFwZUNhcHN1bGUudHMiLCIuLi9zcmMvVlJNU3ByaW5nQm9uZUNvbGxpZGVyU2hhcGVTcGhlcmUudHMiLCIuLi9zcmMvaGVscGVycy91dGlscy9Db2xsaWRlclNoYXBlQ2Fwc3VsZUJ1ZmZlckdlb21ldHJ5LnRzIiwiLi4vc3JjL2hlbHBlcnMvdXRpbHMvQ29sbGlkZXJTaGFwZVNwaGVyZUJ1ZmZlckdlb21ldHJ5LnRzIiwiLi4vc3JjL2hlbHBlcnMvVlJNU3ByaW5nQm9uZUNvbGxpZGVySGVscGVyLnRzIiwiLi4vc3JjL2hlbHBlcnMvdXRpbHMvU3ByaW5nQm9uZUJ1ZmZlckdlb21ldHJ5LnRzIiwiLi4vc3JjL2hlbHBlcnMvVlJNU3ByaW5nQm9uZUpvaW50SGVscGVyLnRzIiwiLi4vc3JjL1ZSTVNwcmluZ0JvbmVDb2xsaWRlci50cyIsIi4uL3NyYy91dGlscy9tYXQ0SW52ZXJ0Q29tcGF0LnRzIiwiLi4vc3JjL3V0aWxzL01hdHJpeDRJbnZlcnNlQ2FjaGUudHMiLCIuLi9zcmMvVlJNU3ByaW5nQm9uZUpvaW50LnRzIiwiLi4vbm9kZV9tb2R1bGVzL3RzbGliL3RzbGliLmVzNi5qcyIsIi4uL3NyYy91dGlscy90cmF2ZXJzZUFuY2VzdG9yc0Zyb21Sb290LnRzIiwiLi4vc3JjL3V0aWxzL3RyYXZlcnNlQ2hpbGRyZW5VbnRpbENvbmRpdGlvbk1ldC50cyIsIi4uL3NyYy9WUk1TcHJpbmdCb25lTWFuYWdlci50cyIsIi4uL3NyYy9WUk1TcHJpbmdCb25lTG9hZGVyUGx1Z2luLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogUmVwcmVzZW50cyBhIHNoYXBlIG9mIGEgY29sbGlkZXIuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBWUk1TcHJpbmdCb25lQ29sbGlkZXJTaGFwZSB7XG4gIC8qKlxuICAgKiBUaGUgdHlwZSBvZiB0aGUgc2hhcGUuXG4gICAqL1xuICBwdWJsaWMgYWJzdHJhY3QgZ2V0IHR5cGUoKTogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBDYWxjdWxhdGUgYSBkaXN0YW5jZSBhbmQgYSBkaXJlY3Rpb24gZnJvbSB0aGUgY29sbGlkZXIgdG8gYSB0YXJnZXQgb2JqZWN0LlxuICAgKiBJdCdzIGhpdCBpZiB0aGUgZGlzdGFuY2UgaXMgbmVnYXRpdmUuXG4gICAqIFRoZSBkaXJlY3Rpb24gd2lsbCBiZSBjb250YWluZWQgaW4gdGhlIGdpdmVuIHRhcmdldCB2ZWN0b3IuXG4gICAqXG4gICAqIEBwYXJhbSBjb2xsaWRlck1hdHJpeCBBIG1hdHJpeCByZXByZXNlbnRzIHRoZSB0cmFuc2Zvcm0gb2YgdGhlIGNvbGxpZGVyXG4gICAqIEBwYXJhbSBvYmplY3RQb3NpdGlvbiBBIHZlY3RvciByZXByZXNlbnRzIHRoZSBwb3NpdGlvbiBvZiB0aGUgdGFyZ2V0IG9iamVjdFxuICAgKiBAcGFyYW0gb2JqZWN0UmFkaXVzIFRoZSByYWRpdXMgb2YgdGhlIG9iamVjdFxuICAgKiBAcGFyYW0gdGFyZ2V0IFRoZSByZXN1bHQgZGlyZWN0aW9uIHdpbGwgYmUgY29udGFpbmVkIGluIHRoaXMgdmVjdG9yXG4gICAqL1xuICBwdWJsaWMgYWJzdHJhY3QgY2FsY3VsYXRlQ29sbGlzaW9uKFxuICAgIGNvbGxpZGVyTWF0cml4OiBUSFJFRS5NYXRyaXg0LFxuICAgIG9iamVjdFBvc2l0aW9uOiBUSFJFRS5WZWN0b3IzLFxuICAgIG9iamVjdFJhZGl1czogbnVtYmVyLFxuICAgIHRhcmdldDogVEhSRUUuVmVjdG9yMyxcbiAgKTogbnVtYmVyO1xufVxuIiwiaW1wb3J0ICogYXMgVEhSRUUgZnJvbSAndGhyZWUnO1xuaW1wb3J0IHsgVlJNU3ByaW5nQm9uZUNvbGxpZGVyU2hhcGUgfSBmcm9tICcuL1ZSTVNwcmluZ0JvbmVDb2xsaWRlclNoYXBlJztcblxuY29uc3QgX3YzQSA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG5jb25zdCBfdjNCID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcblxuZXhwb3J0IGNsYXNzIFZSTVNwcmluZ0JvbmVDb2xsaWRlclNoYXBlQ2Fwc3VsZSBleHRlbmRzIFZSTVNwcmluZ0JvbmVDb2xsaWRlclNoYXBlIHtcbiAgcHVibGljIGdldCB0eXBlKCk6ICdjYXBzdWxlJyB7XG4gICAgcmV0dXJuICdjYXBzdWxlJztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgb2Zmc2V0IG9mIHRoZSBoZWFkIGZyb20gdGhlIG9yaWdpbi5cbiAgICovXG4gIHB1YmxpYyBvZmZzZXQ6IFRIUkVFLlZlY3RvcjM7XG5cbiAgLyoqXG4gICAqIFRoZSBvZmZzZXQgb2YgdGhlIHRhaWwgZnJvbSB0aGUgb3JpZ2luLlxuICAgKi9cbiAgcHVibGljIHRhaWw6IFRIUkVFLlZlY3RvcjM7XG5cbiAgLyoqXG4gICAqIFRoZSByYWRpdXMuXG4gICAqL1xuICBwdWJsaWMgcmFkaXVzOiBudW1iZXI7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKHBhcmFtcz86IHsgcmFkaXVzPzogbnVtYmVyOyBvZmZzZXQ/OiBUSFJFRS5WZWN0b3IzOyB0YWlsPzogVEhSRUUuVmVjdG9yMyB9KSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMub2Zmc2V0ID0gcGFyYW1zPy5vZmZzZXQgPz8gbmV3IFRIUkVFLlZlY3RvcjMoMC4wLCAwLjAsIDAuMCk7XG4gICAgdGhpcy50YWlsID0gcGFyYW1zPy50YWlsID8/IG5ldyBUSFJFRS5WZWN0b3IzKDAuMCwgMC4wLCAwLjApO1xuICAgIHRoaXMucmFkaXVzID0gcGFyYW1zPy5yYWRpdXMgPz8gMC4wO1xuICB9XG5cbiAgcHVibGljIGNhbGN1bGF0ZUNvbGxpc2lvbihcbiAgICBjb2xsaWRlck1hdHJpeDogVEhSRUUuTWF0cml4NCxcbiAgICBvYmplY3RQb3NpdGlvbjogVEhSRUUuVmVjdG9yMyxcbiAgICBvYmplY3RSYWRpdXM6IG51bWJlcixcbiAgICB0YXJnZXQ6IFRIUkVFLlZlY3RvcjMsXG4gICk6IG51bWJlciB7XG4gICAgX3YzQS5jb3B5KHRoaXMub2Zmc2V0KS5hcHBseU1hdHJpeDQoY29sbGlkZXJNYXRyaXgpOyAvLyB0cmFuc2Zvcm1lZCBoZWFkXG4gICAgX3YzQi5jb3B5KHRoaXMudGFpbCkuYXBwbHlNYXRyaXg0KGNvbGxpZGVyTWF0cml4KTsgLy8gdHJhbnNmb3JtZWQgdGFpbFxuICAgIF92M0Iuc3ViKF92M0EpOyAvLyBmcm9tIGhlYWQgdG8gdGFpbFxuICAgIGNvbnN0IGxlbmd0aFNxQ2Fwc3VsZSA9IF92M0IubGVuZ3RoU3EoKTtcblxuICAgIHRhcmdldC5jb3B5KG9iamVjdFBvc2l0aW9uKS5zdWIoX3YzQSk7IC8vIGZyb20gaGVhZCB0byBvYmplY3RcbiAgICBjb25zdCBkb3QgPSBfdjNCLmRvdCh0YXJnZXQpOyAvLyBkb3QgcHJvZHVjdCBvZiBvZmZzZXRUb1RhaWwgYW5kIG9mZnNldFRvT2JqZWN0XG5cbiAgICBpZiAoZG90IDw9IDAuMCkge1xuICAgICAgLy8gaWYgb2JqZWN0IGlzIG5lYXIgZnJvbSB0aGUgaGVhZFxuICAgICAgLy8gZG8gbm90aGluZywgdXNlIHRoZSBjdXJyZW50IHZhbHVlIGRpcmVjdGx5XG4gICAgfSBlbHNlIGlmIChsZW5ndGhTcUNhcHN1bGUgPD0gZG90KSB7XG4gICAgICAvLyBpZiBvYmplY3QgaXMgbmVhciBmcm9tIHRoZSB0YWlsXG4gICAgICB0YXJnZXQuc3ViKF92M0IpOyAvLyBmcm9tIHRhaWwgdG8gb2JqZWN0XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGlmIG9iamVjdCBpcyBiZXR3ZWVuIHR3byBlbmRzXG4gICAgICBfdjNCLm11bHRpcGx5U2NhbGFyKGRvdCAvIGxlbmd0aFNxQ2Fwc3VsZSk7IC8vIGZyb20gaGVhZCB0byB0aGUgbmVhcmVzdCBwb2ludCBvZiB0aGUgc2hhZnRcbiAgICAgIHRhcmdldC5zdWIoX3YzQik7IC8vIGZyb20gdGhlIHNoYWZ0IHBvaW50IHRvIG9iamVjdFxuICAgIH1cblxuICAgIGNvbnN0IHJhZGl1cyA9IG9iamVjdFJhZGl1cyArIHRoaXMucmFkaXVzO1xuICAgIGNvbnN0IGRpc3RhbmNlID0gdGFyZ2V0Lmxlbmd0aCgpIC0gcmFkaXVzO1xuICAgIHRhcmdldC5ub3JtYWxpemUoKTtcbiAgICByZXR1cm4gZGlzdGFuY2U7XG4gIH1cbn1cbiIsImltcG9ydCAqIGFzIFRIUkVFIGZyb20gJ3RocmVlJztcbmltcG9ydCB7IFZSTVNwcmluZ0JvbmVDb2xsaWRlclNoYXBlIH0gZnJvbSAnLi9WUk1TcHJpbmdCb25lQ29sbGlkZXJTaGFwZSc7XG5cbmV4cG9ydCBjbGFzcyBWUk1TcHJpbmdCb25lQ29sbGlkZXJTaGFwZVNwaGVyZSBleHRlbmRzIFZSTVNwcmluZ0JvbmVDb2xsaWRlclNoYXBlIHtcbiAgcHVibGljIGdldCB0eXBlKCk6ICdzcGhlcmUnIHtcbiAgICByZXR1cm4gJ3NwaGVyZSc7XG4gIH1cblxuICAvKipcbiAgICogVGhlIG9mZnNldCBmcm9tIHRoZSBvcmlnaW4uXG4gICAqL1xuICBwdWJsaWMgb2Zmc2V0OiBUSFJFRS5WZWN0b3IzO1xuXG4gIC8qKlxuICAgKiBUaGUgcmFkaXVzLlxuICAgKi9cbiAgcHVibGljIHJhZGl1czogbnVtYmVyO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihwYXJhbXM/OiB7IHJhZGl1cz86IG51bWJlcjsgb2Zmc2V0PzogVEhSRUUuVmVjdG9yMyB9KSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMub2Zmc2V0ID0gcGFyYW1zPy5vZmZzZXQgPz8gbmV3IFRIUkVFLlZlY3RvcjMoMC4wLCAwLjAsIDAuMCk7XG4gICAgdGhpcy5yYWRpdXMgPSBwYXJhbXM/LnJhZGl1cyA/PyAwLjA7XG4gIH1cblxuICBwdWJsaWMgY2FsY3VsYXRlQ29sbGlzaW9uKFxuICAgIGNvbGxpZGVyTWF0cml4OiBUSFJFRS5NYXRyaXg0LFxuICAgIG9iamVjdFBvc2l0aW9uOiBUSFJFRS5WZWN0b3IzLFxuICAgIG9iamVjdFJhZGl1czogbnVtYmVyLFxuICAgIHRhcmdldDogVEhSRUUuVmVjdG9yMyxcbiAgKTogbnVtYmVyIHtcbiAgICB0YXJnZXQuY29weSh0aGlzLm9mZnNldCkuYXBwbHlNYXRyaXg0KGNvbGxpZGVyTWF0cml4KTsgLy8gdHJhbnNmb3JtZWQgb2Zmc2V0XG4gICAgdGFyZ2V0Lm5lZ2F0ZSgpLmFkZChvYmplY3RQb3NpdGlvbik7IC8vIGEgdmVjdG9yIGZyb20gY29sbGlkZXIgY2VudGVyIHRvIG9iamVjdCBwb3NpdGlvblxuICAgIGNvbnN0IHJhZGl1cyA9IG9iamVjdFJhZGl1cyArIHRoaXMucmFkaXVzO1xuICAgIGNvbnN0IGRpc3RhbmNlID0gdGFyZ2V0Lmxlbmd0aCgpIC0gcmFkaXVzO1xuICAgIHRhcmdldC5ub3JtYWxpemUoKTtcbiAgICByZXR1cm4gZGlzdGFuY2U7XG4gIH1cbn1cbiIsImltcG9ydCAqIGFzIFRIUkVFIGZyb20gJ3RocmVlJztcbmltcG9ydCB7IFZSTVNwcmluZ0JvbmVDb2xsaWRlclNoYXBlQ2Fwc3VsZSB9IGZyb20gJy4uLy4uL1ZSTVNwcmluZ0JvbmVDb2xsaWRlclNoYXBlQ2Fwc3VsZSc7XG5pbXBvcnQgeyBDb2xsaWRlclNoYXBlQnVmZmVyR2VvbWV0cnkgfSBmcm9tICcuL0NvbGxpZGVyU2hhcGVCdWZmZXJHZW9tZXRyeSc7XG5cbmNvbnN0IF92ZWNBID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcblxuZXhwb3J0IGNsYXNzIENvbGxpZGVyU2hhcGVDYXBzdWxlQnVmZmVyR2VvbWV0cnkgZXh0ZW5kcyBUSFJFRS5CdWZmZXJHZW9tZXRyeSBpbXBsZW1lbnRzIENvbGxpZGVyU2hhcGVCdWZmZXJHZW9tZXRyeSB7XG4gIHByaXZhdGUgcmVhZG9ubHkgX2F0dHJQb3M6IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZTtcbiAgcHJpdmF0ZSByZWFkb25seSBfYXR0ckluZGV4OiBUSFJFRS5CdWZmZXJBdHRyaWJ1dGU7XG4gIHByaXZhdGUgcmVhZG9ubHkgX3NoYXBlOiBWUk1TcHJpbmdCb25lQ29sbGlkZXJTaGFwZUNhcHN1bGU7XG4gIHByaXZhdGUgX2N1cnJlbnRSYWRpdXMgPSAwO1xuICBwcml2YXRlIHJlYWRvbmx5IF9jdXJyZW50T2Zmc2V0ID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcbiAgcHJpdmF0ZSByZWFkb25seSBfY3VycmVudFRhaWwgPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihzaGFwZTogVlJNU3ByaW5nQm9uZUNvbGxpZGVyU2hhcGVDYXBzdWxlKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuX3NoYXBlID0gc2hhcGU7XG5cbiAgICB0aGlzLl9hdHRyUG9zID0gbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZShuZXcgRmxvYXQzMkFycmF5KDM5NiksIDMpO1xuICAgIHRoaXMuc2V0QXR0cmlidXRlKCdwb3NpdGlvbicsIHRoaXMuX2F0dHJQb3MpO1xuXG4gICAgdGhpcy5fYXR0ckluZGV4ID0gbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZShuZXcgVWludDE2QXJyYXkoMjY0KSwgMSk7XG4gICAgdGhpcy5zZXRJbmRleCh0aGlzLl9hdHRySW5kZXgpO1xuXG4gICAgdGhpcy5fYnVpbGRJbmRleCgpO1xuICAgIHRoaXMudXBkYXRlKCk7XG4gIH1cblxuICBwdWJsaWMgdXBkYXRlKCk6IHZvaWQge1xuICAgIGxldCBzaG91bGRVcGRhdGVHZW9tZXRyeSA9IGZhbHNlO1xuXG4gICAgaWYgKHRoaXMuX2N1cnJlbnRSYWRpdXMgIT09IHRoaXMuX3NoYXBlLnJhZGl1cykge1xuICAgICAgdGhpcy5fY3VycmVudFJhZGl1cyA9IHRoaXMuX3NoYXBlLnJhZGl1cztcbiAgICAgIHNob3VsZFVwZGF0ZUdlb21ldHJ5ID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuX2N1cnJlbnRPZmZzZXQuZXF1YWxzKHRoaXMuX3NoYXBlLm9mZnNldCkpIHtcbiAgICAgIHRoaXMuX2N1cnJlbnRPZmZzZXQuY29weSh0aGlzLl9zaGFwZS5vZmZzZXQpO1xuICAgICAgc2hvdWxkVXBkYXRlR2VvbWV0cnkgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5fY3VycmVudFRhaWwuZXF1YWxzKHRoaXMuX3NoYXBlLnRhaWwpKSB7XG4gICAgICB0aGlzLl9jdXJyZW50VGFpbC5jb3B5KHRoaXMuX3NoYXBlLnRhaWwpO1xuICAgICAgc2hvdWxkVXBkYXRlR2VvbWV0cnkgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmIChzaG91bGRVcGRhdGVHZW9tZXRyeSkge1xuICAgICAgdGhpcy5fYnVpbGRQb3NpdGlvbigpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2J1aWxkUG9zaXRpb24oKTogdm9pZCB7XG4gICAgX3ZlY0EuY29weSh0aGlzLl9jdXJyZW50VGFpbCkuc3ViKHRoaXMuX2N1cnJlbnRPZmZzZXQpO1xuICAgIGNvbnN0IGwgPSBfdmVjQS5sZW5ndGgoKSAvIHRoaXMuX2N1cnJlbnRSYWRpdXM7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8PSAxNjsgaSsrKSB7XG4gICAgICBjb25zdCB0ID0gKGkgLyAxNi4wKSAqIE1hdGguUEk7XG5cbiAgICAgIHRoaXMuX2F0dHJQb3Muc2V0WFlaKGksIC1NYXRoLnNpbih0KSwgLU1hdGguY29zKHQpLCAwLjApO1xuICAgICAgdGhpcy5fYXR0clBvcy5zZXRYWVooMTcgKyBpLCBsICsgTWF0aC5zaW4odCksIE1hdGguY29zKHQpLCAwLjApO1xuICAgICAgdGhpcy5fYXR0clBvcy5zZXRYWVooMzQgKyBpLCAtTWF0aC5zaW4odCksIDAuMCwgLU1hdGguY29zKHQpKTtcbiAgICAgIHRoaXMuX2F0dHJQb3Muc2V0WFlaKDUxICsgaSwgbCArIE1hdGguc2luKHQpLCAwLjAsIE1hdGguY29zKHQpKTtcbiAgICB9XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDMyOyBpKyspIHtcbiAgICAgIGNvbnN0IHQgPSAoaSAvIDE2LjApICogTWF0aC5QSTtcbiAgICAgIHRoaXMuX2F0dHJQb3Muc2V0WFlaKDY4ICsgaSwgMC4wLCBNYXRoLnNpbih0KSwgTWF0aC5jb3ModCkpO1xuICAgICAgdGhpcy5fYXR0clBvcy5zZXRYWVooMTAwICsgaSwgbCwgTWF0aC5zaW4odCksIE1hdGguY29zKHQpKTtcbiAgICB9XG5cbiAgICBjb25zdCB0aGV0YSA9IE1hdGguYXRhbjIoX3ZlY0EueSwgTWF0aC5zcXJ0KF92ZWNBLnggKiBfdmVjQS54ICsgX3ZlY0EueiAqIF92ZWNBLnopKTtcbiAgICBjb25zdCBwaGkgPSAtTWF0aC5hdGFuMihfdmVjQS56LCBfdmVjQS54KTtcblxuICAgIHRoaXMucm90YXRlWih0aGV0YSk7XG4gICAgdGhpcy5yb3RhdGVZKHBoaSk7XG4gICAgdGhpcy5zY2FsZSh0aGlzLl9jdXJyZW50UmFkaXVzLCB0aGlzLl9jdXJyZW50UmFkaXVzLCB0aGlzLl9jdXJyZW50UmFkaXVzKTtcbiAgICB0aGlzLnRyYW5zbGF0ZSh0aGlzLl9jdXJyZW50T2Zmc2V0LngsIHRoaXMuX2N1cnJlbnRPZmZzZXQueSwgdGhpcy5fY3VycmVudE9mZnNldC56KTtcblxuICAgIHRoaXMuX2F0dHJQb3MubmVlZHNVcGRhdGUgPSB0cnVlO1xuICB9XG5cbiAgcHJpdmF0ZSBfYnVpbGRJbmRleCgpOiB2b2lkIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDM0OyBpKyspIHtcbiAgICAgIGNvbnN0IGkxID0gKGkgKyAxKSAlIDM0O1xuXG4gICAgICB0aGlzLl9hdHRySW5kZXguc2V0WFkoaSAqIDIsIGksIGkxKTtcbiAgICAgIHRoaXMuX2F0dHJJbmRleC5zZXRYWSg2OCArIGkgKiAyLCAzNCArIGksIDM0ICsgaTEpO1xuICAgIH1cblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMzI7IGkrKykge1xuICAgICAgY29uc3QgaTEgPSAoaSArIDEpICUgMzI7XG5cbiAgICAgIHRoaXMuX2F0dHJJbmRleC5zZXRYWSgxMzYgKyBpICogMiwgNjggKyBpLCA2OCArIGkxKTtcbiAgICAgIHRoaXMuX2F0dHJJbmRleC5zZXRYWSgyMDAgKyBpICogMiwgMTAwICsgaSwgMTAwICsgaTEpO1xuICAgIH1cblxuICAgIHRoaXMuX2F0dHJJbmRleC5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gIH1cbn1cbiIsImltcG9ydCAqIGFzIFRIUkVFIGZyb20gJ3RocmVlJztcbmltcG9ydCB7IFZSTVNwcmluZ0JvbmVDb2xsaWRlclNoYXBlU3BoZXJlIH0gZnJvbSAnLi4vLi4vVlJNU3ByaW5nQm9uZUNvbGxpZGVyU2hhcGVTcGhlcmUnO1xuaW1wb3J0IHsgQ29sbGlkZXJTaGFwZUJ1ZmZlckdlb21ldHJ5IH0gZnJvbSAnLi9Db2xsaWRlclNoYXBlQnVmZmVyR2VvbWV0cnknO1xuXG5leHBvcnQgY2xhc3MgQ29sbGlkZXJTaGFwZVNwaGVyZUJ1ZmZlckdlb21ldHJ5IGV4dGVuZHMgVEhSRUUuQnVmZmVyR2VvbWV0cnkgaW1wbGVtZW50cyBDb2xsaWRlclNoYXBlQnVmZmVyR2VvbWV0cnkge1xuICBwcml2YXRlIHJlYWRvbmx5IF9hdHRyUG9zOiBUSFJFRS5CdWZmZXJBdHRyaWJ1dGU7XG4gIHByaXZhdGUgcmVhZG9ubHkgX2F0dHJJbmRleDogVEhSRUUuQnVmZmVyQXR0cmlidXRlO1xuICBwcml2YXRlIHJlYWRvbmx5IF9zaGFwZTogVlJNU3ByaW5nQm9uZUNvbGxpZGVyU2hhcGVTcGhlcmU7XG4gIHByaXZhdGUgX2N1cnJlbnRSYWRpdXMgPSAwO1xuICBwcml2YXRlIHJlYWRvbmx5IF9jdXJyZW50T2Zmc2V0ID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcblxuICBwdWJsaWMgY29uc3RydWN0b3Ioc2hhcGU6IFZSTVNwcmluZ0JvbmVDb2xsaWRlclNoYXBlU3BoZXJlKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuX3NoYXBlID0gc2hhcGU7XG5cbiAgICB0aGlzLl9hdHRyUG9zID0gbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZShuZXcgRmxvYXQzMkFycmF5KDMyICogMyAqIDMpLCAzKTtcbiAgICB0aGlzLnNldEF0dHJpYnV0ZSgncG9zaXRpb24nLCB0aGlzLl9hdHRyUG9zKTtcblxuICAgIHRoaXMuX2F0dHJJbmRleCA9IG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUobmV3IFVpbnQxNkFycmF5KDY0ICogMyksIDEpO1xuICAgIHRoaXMuc2V0SW5kZXgodGhpcy5fYXR0ckluZGV4KTtcblxuICAgIHRoaXMuX2J1aWxkSW5kZXgoKTtcbiAgICB0aGlzLnVwZGF0ZSgpO1xuICB9XG5cbiAgcHVibGljIHVwZGF0ZSgpOiB2b2lkIHtcbiAgICBsZXQgc2hvdWxkVXBkYXRlR2VvbWV0cnkgPSBmYWxzZTtcblxuICAgIGlmICh0aGlzLl9jdXJyZW50UmFkaXVzICE9PSB0aGlzLl9zaGFwZS5yYWRpdXMpIHtcbiAgICAgIHRoaXMuX2N1cnJlbnRSYWRpdXMgPSB0aGlzLl9zaGFwZS5yYWRpdXM7XG4gICAgICBzaG91bGRVcGRhdGVHZW9tZXRyeSA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLl9jdXJyZW50T2Zmc2V0LmVxdWFscyh0aGlzLl9zaGFwZS5vZmZzZXQpKSB7XG4gICAgICB0aGlzLl9jdXJyZW50T2Zmc2V0LmNvcHkodGhpcy5fc2hhcGUub2Zmc2V0KTtcbiAgICAgIHNob3VsZFVwZGF0ZUdlb21ldHJ5ID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAoc2hvdWxkVXBkYXRlR2VvbWV0cnkpIHtcbiAgICAgIHRoaXMuX2J1aWxkUG9zaXRpb24oKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9idWlsZFBvc2l0aW9uKCk6IHZvaWQge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMzI7IGkrKykge1xuICAgICAgY29uc3QgdCA9IChpIC8gMTYuMCkgKiBNYXRoLlBJO1xuXG4gICAgICB0aGlzLl9hdHRyUG9zLnNldFhZWihpLCBNYXRoLmNvcyh0KSwgTWF0aC5zaW4odCksIDAuMCk7XG4gICAgICB0aGlzLl9hdHRyUG9zLnNldFhZWigzMiArIGksIDAuMCwgTWF0aC5jb3ModCksIE1hdGguc2luKHQpKTtcbiAgICAgIHRoaXMuX2F0dHJQb3Muc2V0WFlaKDY0ICsgaSwgTWF0aC5zaW4odCksIDAuMCwgTWF0aC5jb3ModCkpO1xuICAgIH1cblxuICAgIHRoaXMuc2NhbGUodGhpcy5fY3VycmVudFJhZGl1cywgdGhpcy5fY3VycmVudFJhZGl1cywgdGhpcy5fY3VycmVudFJhZGl1cyk7XG4gICAgdGhpcy50cmFuc2xhdGUodGhpcy5fY3VycmVudE9mZnNldC54LCB0aGlzLl9jdXJyZW50T2Zmc2V0LnksIHRoaXMuX2N1cnJlbnRPZmZzZXQueik7XG5cbiAgICB0aGlzLl9hdHRyUG9zLm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgfVxuXG4gIHByaXZhdGUgX2J1aWxkSW5kZXgoKTogdm9pZCB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAzMjsgaSsrKSB7XG4gICAgICBjb25zdCBpMSA9IChpICsgMSkgJSAzMjtcblxuICAgICAgdGhpcy5fYXR0ckluZGV4LnNldFhZKGkgKiAyLCBpLCBpMSk7XG4gICAgICB0aGlzLl9hdHRySW5kZXguc2V0WFkoNjQgKyBpICogMiwgMzIgKyBpLCAzMiArIGkxKTtcbiAgICAgIHRoaXMuX2F0dHJJbmRleC5zZXRYWSgxMjggKyBpICogMiwgNjQgKyBpLCA2NCArIGkxKTtcbiAgICB9XG5cbiAgICB0aGlzLl9hdHRySW5kZXgubmVlZHNVcGRhdGUgPSB0cnVlO1xuICB9XG59XG4iLCJpbXBvcnQgKiBhcyBUSFJFRSBmcm9tICd0aHJlZSc7XG5pbXBvcnQgeyBWUk1TcHJpbmdCb25lQ29sbGlkZXIgfSBmcm9tICcuLi9WUk1TcHJpbmdCb25lQ29sbGlkZXInO1xuaW1wb3J0IHsgVlJNU3ByaW5nQm9uZUNvbGxpZGVyU2hhcGVDYXBzdWxlIH0gZnJvbSAnLi4vVlJNU3ByaW5nQm9uZUNvbGxpZGVyU2hhcGVDYXBzdWxlJztcbmltcG9ydCB7IFZSTVNwcmluZ0JvbmVDb2xsaWRlclNoYXBlU3BoZXJlIH0gZnJvbSAnLi4vVlJNU3ByaW5nQm9uZUNvbGxpZGVyU2hhcGVTcGhlcmUnO1xuaW1wb3J0IHsgQ29sbGlkZXJTaGFwZUJ1ZmZlckdlb21ldHJ5IH0gZnJvbSAnLi91dGlscy9Db2xsaWRlclNoYXBlQnVmZmVyR2VvbWV0cnknO1xuaW1wb3J0IHsgQ29sbGlkZXJTaGFwZUNhcHN1bGVCdWZmZXJHZW9tZXRyeSB9IGZyb20gJy4vdXRpbHMvQ29sbGlkZXJTaGFwZUNhcHN1bGVCdWZmZXJHZW9tZXRyeSc7XG5pbXBvcnQgeyBDb2xsaWRlclNoYXBlU3BoZXJlQnVmZmVyR2VvbWV0cnkgfSBmcm9tICcuL3V0aWxzL0NvbGxpZGVyU2hhcGVTcGhlcmVCdWZmZXJHZW9tZXRyeSc7XG5cbmV4cG9ydCBjbGFzcyBWUk1TcHJpbmdCb25lQ29sbGlkZXJIZWxwZXIgZXh0ZW5kcyBUSFJFRS5Hcm91cCB7XG4gIHB1YmxpYyByZWFkb25seSBjb2xsaWRlcjogVlJNU3ByaW5nQm9uZUNvbGxpZGVyO1xuICBwcml2YXRlIHJlYWRvbmx5IF9nZW9tZXRyeTogQ29sbGlkZXJTaGFwZUJ1ZmZlckdlb21ldHJ5O1xuICBwcml2YXRlIHJlYWRvbmx5IF9saW5lOiBUSFJFRS5MaW5lU2VnbWVudHM7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKGNvbGxpZGVyOiBWUk1TcHJpbmdCb25lQ29sbGlkZXIpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMubWF0cml4QXV0b1VwZGF0ZSA9IGZhbHNlO1xuXG4gICAgdGhpcy5jb2xsaWRlciA9IGNvbGxpZGVyO1xuXG4gICAgaWYgKHRoaXMuY29sbGlkZXIuc2hhcGUgaW5zdGFuY2VvZiBWUk1TcHJpbmdCb25lQ29sbGlkZXJTaGFwZVNwaGVyZSkge1xuICAgICAgdGhpcy5fZ2VvbWV0cnkgPSBuZXcgQ29sbGlkZXJTaGFwZVNwaGVyZUJ1ZmZlckdlb21ldHJ5KHRoaXMuY29sbGlkZXIuc2hhcGUpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5jb2xsaWRlci5zaGFwZSBpbnN0YW5jZW9mIFZSTVNwcmluZ0JvbmVDb2xsaWRlclNoYXBlQ2Fwc3VsZSkge1xuICAgICAgdGhpcy5fZ2VvbWV0cnkgPSBuZXcgQ29sbGlkZXJTaGFwZUNhcHN1bGVCdWZmZXJHZW9tZXRyeSh0aGlzLmNvbGxpZGVyLnNoYXBlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdWUk1TcHJpbmdCb25lQ29sbGlkZXJIZWxwZXI6IFVua25vd24gY29sbGlkZXIgc2hhcGUgdHlwZSBkZXRlY3RlZCcpO1xuICAgIH1cblxuICAgIGNvbnN0IG1hdGVyaWFsID0gbmV3IFRIUkVFLkxpbmVCYXNpY01hdGVyaWFsKHtcbiAgICAgIGNvbG9yOiAweGZmMDBmZixcbiAgICAgIGRlcHRoVGVzdDogZmFsc2UsXG4gICAgICBkZXB0aFdyaXRlOiBmYWxzZSxcbiAgICB9KTtcblxuICAgIHRoaXMuX2xpbmUgPSBuZXcgVEhSRUUuTGluZVNlZ21lbnRzKHRoaXMuX2dlb21ldHJ5LCBtYXRlcmlhbCk7XG4gICAgdGhpcy5hZGQodGhpcy5fbGluZSk7XG4gIH1cblxuICBwdWJsaWMgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9nZW9tZXRyeS5kaXNwb3NlKCk7XG4gIH1cblxuICBwdWJsaWMgdXBkYXRlTWF0cml4V29ybGQoZm9yY2U6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLmNvbGxpZGVyLnVwZGF0ZVdvcmxkTWF0cml4KHRydWUsIGZhbHNlKTtcblxuICAgIHRoaXMubWF0cml4LmNvcHkodGhpcy5jb2xsaWRlci5tYXRyaXhXb3JsZCk7XG5cbiAgICB0aGlzLl9nZW9tZXRyeS51cGRhdGUoKTtcblxuICAgIHN1cGVyLnVwZGF0ZU1hdHJpeFdvcmxkKGZvcmNlKTtcbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgVEhSRUUgZnJvbSAndGhyZWUnO1xuaW1wb3J0IHsgVlJNU3ByaW5nQm9uZUpvaW50IH0gZnJvbSAnLi4vLi4vVlJNU3ByaW5nQm9uZUpvaW50JztcblxuZXhwb3J0IGNsYXNzIFNwcmluZ0JvbmVCdWZmZXJHZW9tZXRyeSBleHRlbmRzIFRIUkVFLkJ1ZmZlckdlb21ldHJ5IHtcbiAgcHJpdmF0ZSByZWFkb25seSBfYXR0clBvczogVEhSRUUuQnVmZmVyQXR0cmlidXRlO1xuICBwcml2YXRlIHJlYWRvbmx5IF9hdHRySW5kZXg6IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZTtcbiAgcHJpdmF0ZSByZWFkb25seSBfc3ByaW5nQm9uZTogVlJNU3ByaW5nQm9uZUpvaW50O1xuICBwcml2YXRlIF9jdXJyZW50UmFkaXVzID0gMDtcbiAgcHJpdmF0ZSByZWFkb25seSBfY3VycmVudFRhaWwgPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihzcHJpbmdCb25lOiBWUk1TcHJpbmdCb25lSm9pbnQpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5fc3ByaW5nQm9uZSA9IHNwcmluZ0JvbmU7XG5cbiAgICB0aGlzLl9hdHRyUG9zID0gbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZShuZXcgRmxvYXQzMkFycmF5KDI5NCksIDMpO1xuICAgIHRoaXMuc2V0QXR0cmlidXRlKCdwb3NpdGlvbicsIHRoaXMuX2F0dHJQb3MpO1xuXG4gICAgdGhpcy5fYXR0ckluZGV4ID0gbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZShuZXcgVWludDE2QXJyYXkoMTk0KSwgMSk7XG4gICAgdGhpcy5zZXRJbmRleCh0aGlzLl9hdHRySW5kZXgpO1xuXG4gICAgdGhpcy5fYnVpbGRJbmRleCgpO1xuICAgIHRoaXMudXBkYXRlKCk7XG4gIH1cblxuICBwdWJsaWMgdXBkYXRlKCk6IHZvaWQge1xuICAgIGxldCBzaG91bGRVcGRhdGVHZW9tZXRyeSA9IGZhbHNlO1xuXG4gICAgaWYgKHRoaXMuX2N1cnJlbnRSYWRpdXMgIT09IHRoaXMuX3NwcmluZ0JvbmUuc2V0dGluZ3MuaGl0UmFkaXVzKSB7XG4gICAgICB0aGlzLl9jdXJyZW50UmFkaXVzID0gdGhpcy5fc3ByaW5nQm9uZS5zZXR0aW5ncy5oaXRSYWRpdXM7XG4gICAgICBzaG91bGRVcGRhdGVHZW9tZXRyeSA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLl9jdXJyZW50VGFpbC5lcXVhbHModGhpcy5fc3ByaW5nQm9uZS5pbml0aWFsTG9jYWxDaGlsZFBvc2l0aW9uKSkge1xuICAgICAgdGhpcy5fY3VycmVudFRhaWwuY29weSh0aGlzLl9zcHJpbmdCb25lLmluaXRpYWxMb2NhbENoaWxkUG9zaXRpb24pO1xuICAgICAgc2hvdWxkVXBkYXRlR2VvbWV0cnkgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmIChzaG91bGRVcGRhdGVHZW9tZXRyeSkge1xuICAgICAgdGhpcy5fYnVpbGRQb3NpdGlvbigpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2J1aWxkUG9zaXRpb24oKTogdm9pZCB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAzMjsgaSsrKSB7XG4gICAgICBjb25zdCB0ID0gKGkgLyAxNi4wKSAqIE1hdGguUEk7XG5cbiAgICAgIHRoaXMuX2F0dHJQb3Muc2V0WFlaKGksIE1hdGguY29zKHQpLCBNYXRoLnNpbih0KSwgMC4wKTtcbiAgICAgIHRoaXMuX2F0dHJQb3Muc2V0WFlaKDMyICsgaSwgMC4wLCBNYXRoLmNvcyh0KSwgTWF0aC5zaW4odCkpO1xuICAgICAgdGhpcy5fYXR0clBvcy5zZXRYWVooNjQgKyBpLCBNYXRoLnNpbih0KSwgMC4wLCBNYXRoLmNvcyh0KSk7XG4gICAgfVxuXG4gICAgdGhpcy5zY2FsZSh0aGlzLl9jdXJyZW50UmFkaXVzLCB0aGlzLl9jdXJyZW50UmFkaXVzLCB0aGlzLl9jdXJyZW50UmFkaXVzKTtcbiAgICB0aGlzLnRyYW5zbGF0ZSh0aGlzLl9jdXJyZW50VGFpbC54LCB0aGlzLl9jdXJyZW50VGFpbC55LCB0aGlzLl9jdXJyZW50VGFpbC56KTtcblxuICAgIHRoaXMuX2F0dHJQb3Muc2V0WFlaKDk2LCAwLCAwLCAwKTtcbiAgICB0aGlzLl9hdHRyUG9zLnNldFhZWig5NywgdGhpcy5fY3VycmVudFRhaWwueCwgdGhpcy5fY3VycmVudFRhaWwueSwgdGhpcy5fY3VycmVudFRhaWwueik7XG5cbiAgICB0aGlzLl9hdHRyUG9zLm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgfVxuXG4gIHByaXZhdGUgX2J1aWxkSW5kZXgoKTogdm9pZCB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAzMjsgaSsrKSB7XG4gICAgICBjb25zdCBpMSA9IChpICsgMSkgJSAzMjtcblxuICAgICAgdGhpcy5fYXR0ckluZGV4LnNldFhZKGkgKiAyLCBpLCBpMSk7XG4gICAgICB0aGlzLl9hdHRySW5kZXguc2V0WFkoNjQgKyBpICogMiwgMzIgKyBpLCAzMiArIGkxKTtcbiAgICAgIHRoaXMuX2F0dHJJbmRleC5zZXRYWSgxMjggKyBpICogMiwgNjQgKyBpLCA2NCArIGkxKTtcbiAgICB9XG4gICAgdGhpcy5fYXR0ckluZGV4LnNldFhZKDE5MiwgOTYsIDk3KTtcblxuICAgIHRoaXMuX2F0dHJJbmRleC5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gIH1cbn1cbiIsImltcG9ydCAqIGFzIFRIUkVFIGZyb20gJ3RocmVlJztcbmltcG9ydCB7IFZSTVNwcmluZ0JvbmVKb2ludCB9IGZyb20gJy4uL1ZSTVNwcmluZ0JvbmVKb2ludCc7XG5pbXBvcnQgeyBTcHJpbmdCb25lQnVmZmVyR2VvbWV0cnkgfSBmcm9tICcuL3V0aWxzL1NwcmluZ0JvbmVCdWZmZXJHZW9tZXRyeSc7XG5cbmV4cG9ydCBjbGFzcyBWUk1TcHJpbmdCb25lSm9pbnRIZWxwZXIgZXh0ZW5kcyBUSFJFRS5Hcm91cCB7XG4gIHB1YmxpYyByZWFkb25seSBzcHJpbmdCb25lOiBWUk1TcHJpbmdCb25lSm9pbnQ7XG4gIHByaXZhdGUgcmVhZG9ubHkgX2dlb21ldHJ5OiBTcHJpbmdCb25lQnVmZmVyR2VvbWV0cnk7XG4gIHByaXZhdGUgcmVhZG9ubHkgX2xpbmU6IFRIUkVFLkxpbmVTZWdtZW50cztcblxuICBwdWJsaWMgY29uc3RydWN0b3Ioc3ByaW5nQm9uZTogVlJNU3ByaW5nQm9uZUpvaW50KSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLm1hdHJpeEF1dG9VcGRhdGUgPSBmYWxzZTtcblxuICAgIHRoaXMuc3ByaW5nQm9uZSA9IHNwcmluZ0JvbmU7XG5cbiAgICB0aGlzLl9nZW9tZXRyeSA9IG5ldyBTcHJpbmdCb25lQnVmZmVyR2VvbWV0cnkodGhpcy5zcHJpbmdCb25lKTtcblxuICAgIGNvbnN0IG1hdGVyaWFsID0gbmV3IFRIUkVFLkxpbmVCYXNpY01hdGVyaWFsKHtcbiAgICAgIGNvbG9yOiAweGZmZmYwMCxcbiAgICAgIGRlcHRoVGVzdDogZmFsc2UsXG4gICAgICBkZXB0aFdyaXRlOiBmYWxzZSxcbiAgICB9KTtcblxuICAgIHRoaXMuX2xpbmUgPSBuZXcgVEhSRUUuTGluZVNlZ21lbnRzKHRoaXMuX2dlb21ldHJ5LCBtYXRlcmlhbCk7XG4gICAgdGhpcy5hZGQodGhpcy5fbGluZSk7XG4gIH1cblxuICBwdWJsaWMgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9nZW9tZXRyeS5kaXNwb3NlKCk7XG4gIH1cblxuICBwdWJsaWMgdXBkYXRlTWF0cml4V29ybGQoZm9yY2U6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLnNwcmluZ0JvbmUuYm9uZS51cGRhdGVXb3JsZE1hdHJpeCh0cnVlLCBmYWxzZSk7XG5cbiAgICB0aGlzLm1hdHJpeC5jb3B5KHRoaXMuc3ByaW5nQm9uZS5ib25lLm1hdHJpeFdvcmxkKTtcblxuICAgIHRoaXMuX2dlb21ldHJ5LnVwZGF0ZSgpO1xuXG4gICAgc3VwZXIudXBkYXRlTWF0cml4V29ybGQoZm9yY2UpO1xuICB9XG59XG4iLCJpbXBvcnQgKiBhcyBUSFJFRSBmcm9tICd0aHJlZSc7XG5pbXBvcnQgdHlwZSB7IFZSTVNwcmluZ0JvbmVDb2xsaWRlclNoYXBlIH0gZnJvbSAnLi9WUk1TcHJpbmdCb25lQ29sbGlkZXJTaGFwZSc7XG5cbi8qKlxuICogUmVwcmVzZW50cyBhIGNvbGxpZGVyIG9mIGEgVlJNLlxuICovXG5leHBvcnQgY2xhc3MgVlJNU3ByaW5nQm9uZUNvbGxpZGVyIGV4dGVuZHMgVEhSRUUuT2JqZWN0M0Qge1xuICAvKipcbiAgICogVGhlIHNoYXBlIG9mIHRoZSBjb2xsaWRlci5cbiAgICovXG4gIHB1YmxpYyByZWFkb25seSBzaGFwZTogVlJNU3ByaW5nQm9uZUNvbGxpZGVyU2hhcGU7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKHNoYXBlOiBWUk1TcHJpbmdCb25lQ29sbGlkZXJTaGFwZSkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLnNoYXBlID0gc2hhcGU7XG4gIH1cbn1cbiIsImltcG9ydCAqIGFzIFRIUkVFIGZyb20gJ3RocmVlJztcblxuY29uc3QgX21hdEEgPSBuZXcgVEhSRUUuTWF0cml4NCgpO1xuXG4vKipcbiAqIEEgY29tcGF0IGZ1bmN0aW9uIGZvciBgTWF0cml4NC5pbnZlcnQoKWAgLyBgTWF0cml4NC5nZXRJbnZlcnNlKClgLlxuICogYE1hdHJpeDQuaW52ZXJ0KClgIGlzIGludHJvZHVjZWQgaW4gcjEyMyBhbmQgYE1hdHJpeDQuZ2V0SW52ZXJzZSgpYCBlbWl0cyBhIHdhcm5pbmcuXG4gKiBXZSBhcmUgZ29pbmcgdG8gdXNlIHRoaXMgY29tcGF0IGZvciBhIHdoaWxlLlxuICogQHBhcmFtIHRhcmdldCBBIHRhcmdldCBtYXRyaXhcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1hdDRJbnZlcnRDb21wYXQ8VCBleHRlbmRzIFRIUkVFLk1hdHJpeDQ+KHRhcmdldDogVCk6IFQge1xuICBpZiAoKHRhcmdldCBhcyBhbnkpLmludmVydCkge1xuICAgIHRhcmdldC5pbnZlcnQoKTtcbiAgfSBlbHNlIHtcbiAgICAodGFyZ2V0IGFzIGFueSkuZ2V0SW52ZXJzZShfbWF0QS5jb3B5KHRhcmdldCkpO1xuICB9XG5cbiAgcmV0dXJuIHRhcmdldDtcbn1cbiIsImltcG9ydCAqIGFzIFRIUkVFIGZyb20gJ3RocmVlJztcbmltcG9ydCB7IG1hdDRJbnZlcnRDb21wYXQgfSBmcm9tICcuL21hdDRJbnZlcnRDb21wYXQnO1xuXG5leHBvcnQgY2xhc3MgTWF0cml4NEludmVyc2VDYWNoZSB7XG4gIC8qKlxuICAgKiBUaGUgdGFyZ2V0IG1hdHJpeC5cbiAgICovXG4gIHB1YmxpYyByZWFkb25seSBtYXRyaXg6IFRIUkVFLk1hdHJpeDQ7XG5cbiAgLyoqXG4gICAqIEEgY2FjaGUgb2YgaW52ZXJzZSBvZiBjdXJyZW50IG1hdHJpeC5cbiAgICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX2ludmVyc2VDYWNoZSA9IG5ldyBUSFJFRS5NYXRyaXg0KCk7XG5cbiAgLyoqXG4gICAqIEEgZmxhZyB0aGF0IG1ha2VzIGl0IHdhbnQgdG8gcmVjYWxjdWxhdGUgaXRzIHtAbGluayBfaW52ZXJzZUNhY2hlfS5cbiAgICogV2lsbCBiZSBzZXQgYHRydWVgIHdoZW4gYGVsZW1lbnRzYCBhcmUgbXV0YXRlZCBhbmQgYmUgdXNlZCBpbiBgZ2V0SW52ZXJzZWAuXG4gICAqL1xuICBwcml2YXRlIF9zaG91bGRVcGRhdGVJbnZlcnNlID0gdHJ1ZTtcblxuICAvKipcbiAgICogVGhlIG9yaWdpbmFsIG9mIGBtYXRyaXguZWxlbWVudHNgXG4gICAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9vcmlnaW5hbEVsZW1lbnRzOiBudW1iZXJbXTtcblxuICAvKipcbiAgICogSW52ZXJzZSBvZiBnaXZlbiBtYXRyaXguXG4gICAqIE5vdGUgdGhhdCBpdCB3aWxsIHJldHVybiBpdHMgaW50ZXJuYWwgcHJpdmF0ZSBpbnN0YW5jZS5cbiAgICogTWFrZSBzdXJlIGNvcHlpbmcgdGhpcyBiZWZvcmUgbXV0YXRlIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgZ2V0IGludmVyc2UoKTogVEhSRUUuTWF0cml4NCB7XG4gICAgaWYgKHRoaXMuX3Nob3VsZFVwZGF0ZUludmVyc2UpIHtcbiAgICAgIHRoaXMuX2ludmVyc2VDYWNoZS5jb3B5KHRoaXMubWF0cml4KTtcbiAgICAgIG1hdDRJbnZlcnRDb21wYXQodGhpcy5faW52ZXJzZUNhY2hlKTtcbiAgICAgIHRoaXMuX3Nob3VsZFVwZGF0ZUludmVyc2UgPSBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5faW52ZXJzZUNhY2hlO1xuICB9XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKG1hdHJpeDogVEhSRUUuTWF0cml4NCkge1xuICAgIHRoaXMubWF0cml4ID0gbWF0cml4O1xuXG4gICAgY29uc3QgaGFuZGxlcjogUHJveHlIYW5kbGVyPG51bWJlcltdPiA9IHtcbiAgICAgIC8vQHRzLWlnbm9yZVxuICAgICAgc2V0OiAob2JqLCBwcm9wOiBudW1iZXIsIG5ld1ZhbCkgPT4ge1xuICAgICAgICB0aGlzLl9zaG91bGRVcGRhdGVJbnZlcnNlID0gdHJ1ZTtcbiAgICAgICAgb2JqW3Byb3BdID0gbmV3VmFsO1xuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSxcbiAgICB9O1xuXG4gICAgdGhpcy5fb3JpZ2luYWxFbGVtZW50cyA9IG1hdHJpeC5lbGVtZW50cztcbiAgICBtYXRyaXguZWxlbWVudHMgPSBuZXcgUHJveHkobWF0cml4LmVsZW1lbnRzLCBoYW5kbGVyKTtcbiAgfVxuXG4gIHB1YmxpYyByZXZlcnQoKTogdm9pZCB7XG4gICAgdGhpcy5tYXRyaXguZWxlbWVudHMgPSB0aGlzLl9vcmlnaW5hbEVsZW1lbnRzO1xuICB9XG59XG4iLCJpbXBvcnQgKiBhcyBUSFJFRSBmcm9tICd0aHJlZSc7XG5pbXBvcnQgeyBtYXQ0SW52ZXJ0Q29tcGF0IH0gZnJvbSAnLi91dGlscy9tYXQ0SW52ZXJ0Q29tcGF0JztcbmltcG9ydCB7IE1hdHJpeDRJbnZlcnNlQ2FjaGUgfSBmcm9tICcuL3V0aWxzL01hdHJpeDRJbnZlcnNlQ2FjaGUnO1xuaW1wb3J0IHR5cGUgeyBWUk1TcHJpbmdCb25lQ29sbGlkZXJHcm91cCB9IGZyb20gJy4vVlJNU3ByaW5nQm9uZUNvbGxpZGVyR3JvdXAnO1xuaW1wb3J0IHR5cGUgeyBWUk1TcHJpbmdCb25lSm9pbnRTZXR0aW5ncyB9IGZyb20gJy4vVlJNU3ByaW5nQm9uZUpvaW50U2V0dGluZ3MnO1xuXG4vLyBiYXNlZCBvblxuLy8gaHR0cDovL3JvY2tldGp1bXAuc2tyLmpwL3VuaXR5M2QvMTA5L1xuLy8gaHR0cHM6Ly9naXRodWIuY29tL2R3YW5nby9VbmlWUk0vYmxvYi9tYXN0ZXIvU2NyaXB0cy9TcHJpbmdCb25lL1ZSTVNwcmluZ0JvbmUuY3NcblxuY29uc3QgSURFTlRJVFlfTUFUUklYNCA9IG5ldyBUSFJFRS5NYXRyaXg0KCk7XG5cbi8vIOioiOeul+S4reOBruS4gOaZguS/neWtmOeUqOWkieaVsO+8iOS4gOW6puOCpOODs+OCueOCv+ODs+OCueOCkuS9nOOBo+OBn+OCieOBguOBqOOBr+S9v+OBhOWbnuOBme+8iVxuY29uc3QgX3YzQSA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG5jb25zdCBfdjNCID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcbmNvbnN0IF92M0MgPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xuXG4vKipcbiAqIEEgdGVtcG9yYXJ5IHZhcmlhYmxlIHdoaWNoIGlzIHVzZWQgaW4gYHVwZGF0ZWBcbiAqL1xuY29uc3QgX3dvcmxkU3BhY2VQb3NpdGlvbiA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG5cbi8qKlxuICogQSB0ZW1wb3JhcnkgdmFyaWFibGUgd2hpY2ggaXMgdXNlZCBpbiBgdXBkYXRlYFxuICovXG5jb25zdCBfY2VudGVyU3BhY2VQb3NpdGlvbiA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG5cbi8qKlxuICogQSB0ZW1wb3JhcnkgdmFyaWFibGUgd2hpY2ggaXMgdXNlZCBpbiBgdXBkYXRlYFxuICovXG5jb25zdCBfbmV4dFRhaWwgPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xuXG5jb25zdCBfcXVhdEEgPSBuZXcgVEhSRUUuUXVhdGVybmlvbigpO1xuY29uc3QgX21hdEEgPSBuZXcgVEhSRUUuTWF0cml4NCgpO1xuY29uc3QgX21hdEIgPSBuZXcgVEhSRUUuTWF0cml4NCgpO1xuXG4vKipcbiAqIEEgY2xhc3MgcmVwcmVzZW50cyBhIHNpbmdsZSBqb2ludCBvZiBhIHNwcmluZyBib25lLlxuICogSXQgc2hvdWxkIGJlIG1hbmFnZWQgYnkgYSBbW1ZSTVNwcmluZ0JvbmVNYW5hZ2VyXV0uXG4gKi9cbmV4cG9ydCBjbGFzcyBWUk1TcHJpbmdCb25lSm9pbnQge1xuICAvKipcbiAgICogU2V0dGluZ3Mgb2YgdGhlIGJvbmUuXG4gICAqL1xuICBwdWJsaWMgc2V0dGluZ3M6IFZSTVNwcmluZ0JvbmVKb2ludFNldHRpbmdzO1xuXG4gIC8qKlxuICAgKiBDb2xsaWRlciBncm91cHMgYXR0YWNoZWQgdG8gdGhpcyBib25lLlxuICAgKi9cbiAgcHVibGljIGNvbGxpZGVyR3JvdXBzOiBWUk1TcHJpbmdCb25lQ29sbGlkZXJHcm91cFtdO1xuXG4gIC8qKlxuICAgKiBBbiBPYmplY3QzRCBhdHRhY2hlZCB0byB0aGlzIGJvbmUuXG4gICAqL1xuICBwdWJsaWMgcmVhZG9ubHkgYm9uZTogVEhSRUUuT2JqZWN0M0Q7XG5cbiAgLyoqXG4gICAqIEFuIE9iamVjdDNEIHRoYXQgd2lsbCBiZSB1c2VkIGFzIGEgdGFpbCBvZiB0aGlzIHNwcmluZyBib25lLlxuICAgKiBJdCBjYW4gYmUgbnVsbCB3aGVuIHRoZSBzcHJpbmcgYm9uZSBpcyBpbXBvcnRlZCBmcm9tIFZSTSAwLjAuXG4gICAqL1xuICBwdWJsaWMgcmVhZG9ubHkgY2hpbGQ6IFRIUkVFLk9iamVjdDNEIHwgbnVsbDtcblxuICAvKipcbiAgICogQ3VycmVudCBwb3NpdGlvbiBvZiBjaGlsZCB0YWlsLCBpbiBjZW50ZXIgdW5pdC4gV2lsbCBiZSB1c2VkIGZvciB2ZXJsZXQgaW50ZWdyYXRpb24uXG4gICAqL1xuICBwcml2YXRlIF9jdXJyZW50VGFpbCA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG5cbiAgLyoqXG4gICAqIFByZXZpb3VzIHBvc2l0aW9uIG9mIGNoaWxkIHRhaWwsIGluIGNlbnRlciB1bml0LiBXaWxsIGJlIHVzZWQgZm9yIHZlcmxldCBpbnRlZ3JhdGlvbi5cbiAgICovXG4gIHByaXZhdGUgX3ByZXZUYWlsID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcblxuICAvKipcbiAgICogSW5pdGlhbCBheGlzIG9mIHRoZSBib25lLCBpbiBsb2NhbCB1bml0LlxuICAgKi9cbiAgcHJpdmF0ZSBfYm9uZUF4aXMgPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xuXG4gIC8qKlxuICAgKiBMZW5ndGggb2YgdGhlIGJvbmUgaW4gd29ybGQgdW5pdC4gV2lsbCBiZSB1c2VkIGZvciBub3JtYWxpemF0aW9uIGluIHVwZGF0ZSBsb29wLlxuICAgKiBJdCdzIHNhbWUgYXMgbG9jYWwgdW5pdCBsZW5ndGggdW5sZXNzIHRoZXJlIGFyZSBzY2FsZSB0cmFuc2Zvcm1hdGlvbnMgaW4gdGhlIHdvcmxkIHNwYWNlLlxuICAgKi9cbiAgcHJpdmF0ZSBfd29ybGRTcGFjZUJvbmVMZW5ndGggPSAwLjA7XG5cbiAgLyoqXG4gICAqIFRoaXMgc3ByaW5nYm9uZSB3aWxsIGJlIGNhbGN1bGF0ZWQgYmFzZWQgb24gdGhlIHNwYWNlIHJlbGF0aXZlIGZyb20gdGhpcyBvYmplY3QuXG4gICAqIElmIHRoaXMgaXMgYG51bGxgLCBzcHJpbmdib25lIHdpbGwgYmUgY2FsY3VsYXRlZCBpbiB3b3JsZCBzcGFjZS5cbiAgICovXG4gIHByaXZhdGUgX2NlbnRlcjogVEhSRUUuT2JqZWN0M0QgfCBudWxsID0gbnVsbDtcbiAgcHVibGljIGdldCBjZW50ZXIoKTogVEhSRUUuT2JqZWN0M0QgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fY2VudGVyO1xuICB9XG4gIHB1YmxpYyBzZXQgY2VudGVyKGNlbnRlcjogVEhSRUUuT2JqZWN0M0QgfCBudWxsKSB7XG4gICAgLy8gdW5pbnN0YWxsIGludmVyc2UgY2FjaGVcbiAgICBpZiAodGhpcy5fY2VudGVyPy51c2VyRGF0YS5pbnZlcnNlQ2FjaGVQcm94eSkge1xuICAgICAgKHRoaXMuX2NlbnRlci51c2VyRGF0YS5pbnZlcnNlQ2FjaGVQcm94eSBhcyBNYXRyaXg0SW52ZXJzZUNhY2hlKS5yZXZlcnQoKTtcbiAgICAgIGRlbGV0ZSB0aGlzLl9jZW50ZXIudXNlckRhdGEuaW52ZXJzZUNhY2hlUHJveHk7XG4gICAgfVxuXG4gICAgLy8gY2hhbmdlIHRoZSBjZW50ZXJcbiAgICB0aGlzLl9jZW50ZXIgPSBjZW50ZXI7XG5cbiAgICAvLyBpbnN0YWxsIGludmVyc2UgY2FjaGVcbiAgICBpZiAodGhpcy5fY2VudGVyKSB7XG4gICAgICBpZiAoIXRoaXMuX2NlbnRlci51c2VyRGF0YS5pbnZlcnNlQ2FjaGVQcm94eSkge1xuICAgICAgICB0aGlzLl9jZW50ZXIudXNlckRhdGEuaW52ZXJzZUNhY2hlUHJveHkgPSBuZXcgTWF0cml4NEludmVyc2VDYWNoZSh0aGlzLl9jZW50ZXIubWF0cml4V29ybGQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsIHN0YXRlIG9mIHRoZSBsb2NhbCBtYXRyaXggb2YgdGhlIGJvbmUuXG4gICAqL1xuICBwcml2YXRlIF9pbml0aWFsTG9jYWxNYXRyaXggPSBuZXcgVEhSRUUuTWF0cml4NCgpO1xuXG4gIC8qKlxuICAgKiBJbml0aWFsIHN0YXRlIG9mIHRoZSByb3RhdGlvbiBvZiB0aGUgYm9uZS5cbiAgICovXG4gIHByaXZhdGUgX2luaXRpYWxMb2NhbFJvdGF0aW9uID0gbmV3IFRIUkVFLlF1YXRlcm5pb24oKTtcblxuICAvKipcbiAgICogSW5pdGlhbCBzdGF0ZSBvZiB0aGUgcG9zaXRpb24gb2YgaXRzIGNoaWxkLlxuICAgKi9cbiAgcHJpdmF0ZSBfaW5pdGlhbExvY2FsQ2hpbGRQb3NpdGlvbiA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG4gIHB1YmxpYyBnZXQgaW5pdGlhbExvY2FsQ2hpbGRQb3NpdGlvbigpOiBUSFJFRS5WZWN0b3IzIHtcbiAgICByZXR1cm4gdGhpcy5faW5pdGlhbExvY2FsQ2hpbGRQb3NpdGlvbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB3b3JsZCBtYXRyaXggb2YgaXRzIHBhcmVudCBvYmplY3QuXG4gICAqIE5vdGUgdGhhdCBpdCByZXR1cm5zIGEgcmVmZXJlbmNlIHRvIHRoZSBtYXRyaXguIERvbid0IG11dGF0ZSB0aGlzIGRpcmVjdGx5IVxuICAgKi9cbiAgcHJpdmF0ZSBnZXQgX3BhcmVudE1hdHJpeFdvcmxkKCk6IFRIUkVFLk1hdHJpeDQge1xuICAgIHJldHVybiB0aGlzLmJvbmUucGFyZW50ID8gdGhpcy5ib25lLnBhcmVudC5tYXRyaXhXb3JsZCA6IElERU5USVRZX01BVFJJWDQ7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IFZSTVNwcmluZ0JvbmUuXG4gICAqXG4gICAqIEBwYXJhbSBib25lIEFuIE9iamVjdDNEIHRoYXQgd2lsbCBiZSBhdHRhY2hlZCB0byB0aGlzIGJvbmVcbiAgICogQHBhcmFtIGNoaWxkIEFuIE9iamVjdDNEIHRoYXQgd2lsbCBiZSB1c2VkIGFzIGEgdGFpbCBvZiB0aGlzIHNwcmluZyBib25lLiBJdCBjYW4gYmUgbnVsbCB3aGVuIHRoZSBzcHJpbmcgYm9uZSBpcyBpbXBvcnRlZCBmcm9tIFZSTSAwLjBcbiAgICogQHBhcmFtIHNldHRpbmdzIFNldmVyYWwgcGFyYW1ldGVycyByZWxhdGVkIHRvIGJlaGF2aW9yIG9mIHRoZSBzcHJpbmcgYm9uZVxuICAgKiBAcGFyYW0gY29sbGlkZXJHcm91cHMgQ29sbGlkZXIgZ3JvdXBzIHRoYXQgd2lsbCBiZSBjb2xsaWRlZCB3aXRoIHRoaXMgc3ByaW5nIGJvbmVcbiAgICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIGJvbmU6IFRIUkVFLk9iamVjdDNELFxuICAgIGNoaWxkOiBUSFJFRS5PYmplY3QzRCB8IG51bGwsXG4gICAgc2V0dGluZ3M6IFBhcnRpYWw8VlJNU3ByaW5nQm9uZUpvaW50U2V0dGluZ3M+ID0ge30sXG4gICAgY29sbGlkZXJHcm91cHM6IFZSTVNwcmluZ0JvbmVDb2xsaWRlckdyb3VwW10gPSBbXSxcbiAgKSB7XG4gICAgdGhpcy5ib25lID0gYm9uZTsgLy8gdW5pVlJN44Gn44GuIHBhcmVudFxuICAgIHRoaXMuYm9uZS5tYXRyaXhBdXRvVXBkYXRlID0gZmFsc2U7IC8vIHVwZGF0ZeOBq+OCiOOCiuioiOeul+OBleOCjOOCi+OBruOBp3RocmVlLmpz5YaF44Gn44Gu6Ieq5YuV5Yem55CG44Gv5LiN6KaBXG5cbiAgICB0aGlzLmNoaWxkID0gY2hpbGQ7XG5cbiAgICB0aGlzLnNldHRpbmdzID0ge1xuICAgICAgaGl0UmFkaXVzOiBzZXR0aW5ncy5oaXRSYWRpdXMgPz8gMC4wLFxuICAgICAgc3RpZmZuZXNzOiBzZXR0aW5ncy5zdGlmZm5lc3MgPz8gMS4wLFxuICAgICAgZ3Jhdml0eVBvd2VyOiBzZXR0aW5ncy5ncmF2aXR5UG93ZXIgPz8gMC4wLFxuICAgICAgZ3Jhdml0eURpcjogc2V0dGluZ3MuZ3Jhdml0eURpcj8uY2xvbmUoKSA/PyBuZXcgVEhSRUUuVmVjdG9yMygwLjAsIC0xLjAsIDAuMCksXG4gICAgICBkcmFnRm9yY2U6IHNldHRpbmdzLmRyYWdGb3JjZSA/PyAwLjQsXG4gICAgfTtcblxuICAgIHRoaXMuY29sbGlkZXJHcm91cHMgPSBjb2xsaWRlckdyb3VwcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIGluaXRpYWwgc3RhdGUgb2YgdGhpcyBzcHJpbmcgYm9uZS5cbiAgICogWW91IG1pZ2h0IHdhbnQgdG8gY2FsbCB7QGxpbmsgVlJNU3ByaW5nQm9uZU1hbmFnZXIuc2V0SW5pdFN0YXRlfSBpbnN0ZWFkLlxuICAgKi9cbiAgcHVibGljIHNldEluaXRTdGF0ZSgpOiB2b2lkIHtcbiAgICAvLyByZW1lbWJlciBpbml0aWFsIHBvc2l0aW9uIG9mIGl0c2VsZlxuICAgIHRoaXMuX2luaXRpYWxMb2NhbE1hdHJpeC5jb3B5KHRoaXMuYm9uZS5tYXRyaXgpO1xuICAgIHRoaXMuX2luaXRpYWxMb2NhbFJvdGF0aW9uLmNvcHkodGhpcy5ib25lLnF1YXRlcm5pb24pO1xuXG4gICAgLy8gc2VlIGluaXRpYWwgcG9zaXRpb24gb2YgaXRzIGxvY2FsIGNoaWxkXG4gICAgaWYgKHRoaXMuY2hpbGQpIHtcbiAgICAgIHRoaXMuX2luaXRpYWxMb2NhbENoaWxkUG9zaXRpb24uY29weSh0aGlzLmNoaWxkLnBvc2l0aW9uKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gdnJtMCByZXF1aXJlcyBhIDdjbSBmaXhlZCBib25lIGxlbmd0aCBmb3IgdGhlIGZpbmFsIG5vZGUgaW4gYSBjaGFpblxuICAgICAgLy8gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vdnJtLWMvdnJtLXNwZWNpZmljYXRpb24vdHJlZS9tYXN0ZXIvc3BlY2lmaWNhdGlvbi9WUk1DX3NwcmluZ0JvbmUtMS4wI2Fib3V0LXNwcmluZy1jb25maWd1cmF0aW9uXG4gICAgICB0aGlzLl9pbml0aWFsTG9jYWxDaGlsZFBvc2l0aW9uLmNvcHkodGhpcy5ib25lLnBvc2l0aW9uKS5ub3JtYWxpemUoKS5tdWx0aXBseVNjYWxhcigwLjA3KTtcbiAgICB9XG5cbiAgICAvLyBjb3B5IHRoZSBjaGlsZCBwb3NpdGlvbiB0byB0YWlsc1xuICAgIHRoaXMuYm9uZS5sb2NhbFRvV29ybGQodGhpcy5fY3VycmVudFRhaWwuY29weSh0aGlzLl9pbml0aWFsTG9jYWxDaGlsZFBvc2l0aW9uKSk7XG4gICAgdGhpcy5fcHJldlRhaWwuY29weSh0aGlzLl9jdXJyZW50VGFpbCk7XG5cbiAgICAvLyBzZXQgaW5pdGlhbCBzdGF0ZXMgdGhhdCBhcmUgcmVsYXRlZCB0byBsb2NhbCBjaGlsZCBwb3NpdGlvblxuICAgIHRoaXMuX2JvbmVBeGlzLmNvcHkodGhpcy5faW5pdGlhbExvY2FsQ2hpbGRQb3NpdGlvbikubm9ybWFsaXplKCk7XG4gICAgdGhpcy5fd29ybGRTcGFjZUJvbmVMZW5ndGggPSBfdjNBXG4gICAgICAuY29weSh0aGlzLl9pbml0aWFsTG9jYWxDaGlsZFBvc2l0aW9uKVxuICAgICAgLmFwcGx5TWF0cml4NCh0aGlzLmJvbmUubWF0cml4V29ybGQpXG4gICAgICAuc3ViKF92M0Iuc2V0RnJvbU1hdHJpeFBvc2l0aW9uKHRoaXMuYm9uZS5tYXRyaXhXb3JsZCkpXG4gICAgICAubGVuZ3RoKCk7XG4gIH1cblxuICAvKipcbiAgICogUmVzZXQgdGhlIHN0YXRlIG9mIHRoaXMgYm9uZS5cbiAgICogWW91IG1pZ2h0IHdhbnQgdG8gY2FsbCBbW1ZSTVNwcmluZ0JvbmVNYW5hZ2VyLnJlc2V0XV0gaW5zdGVhZC5cbiAgICovXG4gIHB1YmxpYyByZXNldCgpOiB2b2lkIHtcbiAgICB0aGlzLmJvbmUucXVhdGVybmlvbi5jb3B5KHRoaXMuX2luaXRpYWxMb2NhbFJvdGF0aW9uKTtcblxuICAgIC8vIFdlIG5lZWQgdG8gdXBkYXRlIGl0cyBtYXRyaXhXb3JsZCBtYW51YWxseSwgc2luY2Ugd2UgdHdlYWtlZCB0aGUgYm9uZSBieSBvdXIgaGFuZFxuICAgIHRoaXMuYm9uZS51cGRhdGVNYXRyaXgoKTtcbiAgICB0aGlzLmJvbmUubWF0cml4V29ybGQubXVsdGlwbHlNYXRyaWNlcyh0aGlzLl9wYXJlbnRNYXRyaXhXb3JsZCwgdGhpcy5ib25lLm1hdHJpeCk7XG5cbiAgICAvLyBBcHBseSB1cGRhdGVkIHBvc2l0aW9uIHRvIHRhaWwgc3RhdGVzXG4gICAgY29uc3QgbWF0cml4V29ybGRUb0NlbnRlciA9IHRoaXMuX2dldE1hdHJpeFdvcmxkVG9DZW50ZXIoX21hdEEpO1xuICAgIHRoaXMuYm9uZS5sb2NhbFRvV29ybGQodGhpcy5fY3VycmVudFRhaWwuY29weSh0aGlzLl9pbml0aWFsTG9jYWxDaGlsZFBvc2l0aW9uKSkuYXBwbHlNYXRyaXg0KG1hdHJpeFdvcmxkVG9DZW50ZXIpO1xuICAgIHRoaXMuX3ByZXZUYWlsLmNvcHkodGhpcy5fY3VycmVudFRhaWwpO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSB0aGUgc3RhdGUgb2YgdGhpcyBib25lLlxuICAgKiBZb3UgbWlnaHQgd2FudCB0byBjYWxsIFtbVlJNU3ByaW5nQm9uZU1hbmFnZXIudXBkYXRlXV0gaW5zdGVhZC5cbiAgICpcbiAgICogQHBhcmFtIGRlbHRhIGRlbHRhVGltZVxuICAgKi9cbiAgcHVibGljIHVwZGF0ZShkZWx0YTogbnVtYmVyKTogdm9pZCB7XG4gICAgaWYgKGRlbHRhIDw9IDApIHJldHVybjtcblxuICAgIC8vIEdldCBib25lIHBvc2l0aW9uIGluIGNlbnRlciBzcGFjZVxuICAgIF93b3JsZFNwYWNlUG9zaXRpb24uc2V0RnJvbU1hdHJpeFBvc2l0aW9uKHRoaXMuYm9uZS5tYXRyaXhXb3JsZCk7XG4gICAgbGV0IG1hdHJpeFdvcmxkVG9DZW50ZXIgPSB0aGlzLl9nZXRNYXRyaXhXb3JsZFRvQ2VudGVyKF9tYXRBKTtcbiAgICBfY2VudGVyU3BhY2VQb3NpdGlvbi5jb3B5KF93b3JsZFNwYWNlUG9zaXRpb24pLmFwcGx5TWF0cml4NChtYXRyaXhXb3JsZFRvQ2VudGVyKTtcbiAgICBjb25zdCBxdWF0V29ybGRUb0NlbnRlciA9IF9xdWF0QS5zZXRGcm9tUm90YXRpb25NYXRyaXgobWF0cml4V29ybGRUb0NlbnRlcik7XG5cbiAgICAvLyBHZXQgcGFyZW50IG1hdHJpeCBpbiBjZW50ZXIgc3BhY2VcbiAgICBjb25zdCBjZW50ZXJTcGFjZVBhcmVudE1hdHJpeCA9IF9tYXRCLmNvcHkobWF0cml4V29ybGRUb0NlbnRlcikubXVsdGlwbHkodGhpcy5fcGFyZW50TWF0cml4V29ybGQpO1xuXG4gICAgLy8gR2V0IGJvbmVBeGlzIGluIGNlbnRlciBzcGFjZVxuICAgIGNvbnN0IGNlbnRlclNwYWNlQm9uZUF4aXMgPSBfdjNCXG4gICAgICAuY29weSh0aGlzLl9ib25lQXhpcylcbiAgICAgIC5hcHBseU1hdHJpeDQodGhpcy5faW5pdGlhbExvY2FsTWF0cml4KVxuICAgICAgLmFwcGx5TWF0cml4NChjZW50ZXJTcGFjZVBhcmVudE1hdHJpeClcbiAgICAgIC5zdWIoX2NlbnRlclNwYWNlUG9zaXRpb24pXG4gICAgICAubm9ybWFsaXplKCk7XG5cbiAgICAvLyBncmF2aXR5IGluIGNlbnRlciBzcGFjZVxuICAgIGNvbnN0IGNlbnRlclNwYWNlR3Jhdml0eSA9IF92M0MuY29weSh0aGlzLnNldHRpbmdzLmdyYXZpdHlEaXIpLmFwcGx5UXVhdGVybmlvbihxdWF0V29ybGRUb0NlbnRlcikubm9ybWFsaXplKCk7XG5cbiAgICBjb25zdCBtYXRyaXhDZW50ZXJUb1dvcmxkID0gdGhpcy5fZ2V0TWF0cml4Q2VudGVyVG9Xb3JsZChfbWF0QSk7XG5cbiAgICAvLyB2ZXJsZXTnqY3liIbjgafmrKHjga7kvY3nva7jgpLoqIjnrpdcbiAgICBfbmV4dFRhaWxcbiAgICAgIC5jb3B5KHRoaXMuX2N1cnJlbnRUYWlsKVxuICAgICAgLmFkZChcbiAgICAgICAgX3YzQVxuICAgICAgICAgIC5jb3B5KHRoaXMuX2N1cnJlbnRUYWlsKVxuICAgICAgICAgIC5zdWIodGhpcy5fcHJldlRhaWwpXG4gICAgICAgICAgLm11bHRpcGx5U2NhbGFyKDEgLSB0aGlzLnNldHRpbmdzLmRyYWdGb3JjZSksXG4gICAgICApIC8vIOWJjeODleODrOODvOODoOOBruenu+WLleOCkue2mee2muOBmeOCiyjmuJvoobDjgoLjgYLjgovjgogpXG4gICAgICAuYWRkKF92M0EuY29weShjZW50ZXJTcGFjZUJvbmVBeGlzKS5tdWx0aXBseVNjYWxhcih0aGlzLnNldHRpbmdzLnN0aWZmbmVzcyAqIGRlbHRhKSkgLy8g6Kaq44Gu5Zue6Lui44Gr44KI44KL5a2Q44Oc44O844Oz44Gu56e75YuV55uu5qiZXG4gICAgICAuYWRkKF92M0EuY29weShjZW50ZXJTcGFjZUdyYXZpdHkpLm11bHRpcGx5U2NhbGFyKHRoaXMuc2V0dGluZ3MuZ3Jhdml0eVBvd2VyICogZGVsdGEpKSAvLyDlpJblipvjgavjgojjgovnp7vli5Xph49cbiAgICAgIC5hcHBseU1hdHJpeDQobWF0cml4Q2VudGVyVG9Xb3JsZCk7IC8vIHRhaWzjgpJ3b3JsZCBzcGFjZeOBq+aIu+OBmVxuXG4gICAgLy8gbm9ybWFsaXplIGJvbmUgbGVuZ3RoXG4gICAgX25leHRUYWlsLnN1Yihfd29ybGRTcGFjZVBvc2l0aW9uKS5ub3JtYWxpemUoKS5tdWx0aXBseVNjYWxhcih0aGlzLl93b3JsZFNwYWNlQm9uZUxlbmd0aCkuYWRkKF93b3JsZFNwYWNlUG9zaXRpb24pO1xuXG4gICAgLy8gQ29sbGlzaW9u44Gn56e75YuVXG4gICAgdGhpcy5fY29sbGlzaW9uKF9uZXh0VGFpbCk7XG5cbiAgICAvLyB1cGRhdGUgcHJldlRhaWwgYW5kIGN1cnJlbnRUYWlsXG4gICAgbWF0cml4V29ybGRUb0NlbnRlciA9IHRoaXMuX2dldE1hdHJpeFdvcmxkVG9DZW50ZXIoX21hdEEpO1xuXG4gICAgdGhpcy5fcHJldlRhaWwuY29weSh0aGlzLl9jdXJyZW50VGFpbCk7XG4gICAgdGhpcy5fY3VycmVudFRhaWwuY29weShfdjNBLmNvcHkoX25leHRUYWlsKS5hcHBseU1hdHJpeDQobWF0cml4V29ybGRUb0NlbnRlcikpO1xuXG4gICAgLy8gQXBwbHkgcm90YXRpb24sIGNvbnZlcnQgdmVjdG9yMyB0aGluZyBpbnRvIGFjdHVhbCBxdWF0ZXJuaW9uXG4gICAgLy8gT3JpZ2luYWwgVW5pVlJNIGlzIGRvaW5nIGNlbnRlciB1bml0IGNhbGN1bHVzIGF0IGhlcmUgYnV0IHdlJ3JlIGdvbm5hIGRvIHRoaXMgb24gbG9jYWwgdW5pdFxuICAgIGNvbnN0IHdvcmxkU3BhY2VJbml0aWFsTWF0cml4SW52ID0gbWF0NEludmVydENvbXBhdChcbiAgICAgIF9tYXRBLmNvcHkodGhpcy5fcGFyZW50TWF0cml4V29ybGQpLm11bHRpcGx5KHRoaXMuX2luaXRpYWxMb2NhbE1hdHJpeCksXG4gICAgKTtcbiAgICBjb25zdCBhcHBseVJvdGF0aW9uID0gX3F1YXRBLnNldEZyb21Vbml0VmVjdG9ycyhcbiAgICAgIHRoaXMuX2JvbmVBeGlzLFxuICAgICAgX3YzQS5jb3B5KF9uZXh0VGFpbCkuYXBwbHlNYXRyaXg0KHdvcmxkU3BhY2VJbml0aWFsTWF0cml4SW52KS5ub3JtYWxpemUoKSxcbiAgICApO1xuXG4gICAgdGhpcy5ib25lLnF1YXRlcm5pb24uY29weSh0aGlzLl9pbml0aWFsTG9jYWxSb3RhdGlvbikubXVsdGlwbHkoYXBwbHlSb3RhdGlvbik7XG5cbiAgICAvLyBXZSBuZWVkIHRvIHVwZGF0ZSBpdHMgbWF0cml4V29ybGQgbWFudWFsbHksIHNpbmNlIHdlIHR3ZWFrZWQgdGhlIGJvbmUgYnkgb3VyIGhhbmRcbiAgICB0aGlzLmJvbmUudXBkYXRlTWF0cml4KCk7XG4gICAgdGhpcy5ib25lLm1hdHJpeFdvcmxkLm11bHRpcGx5TWF0cmljZXModGhpcy5fcGFyZW50TWF0cml4V29ybGQsIHRoaXMuYm9uZS5tYXRyaXgpO1xuICB9XG5cbiAgLyoqXG4gICAqIERvIGNvbGxpc2lvbiBtYXRoIGFnYWluc3QgZXZlcnkgY29sbGlkZXJzIGF0dGFjaGVkIHRvIHRoaXMgYm9uZS5cbiAgICpcbiAgICogQHBhcmFtIHRhaWwgVGhlIHRhaWwgeW91IHdhbnQgdG8gcHJvY2Vzc1xuICAgKi9cbiAgcHJpdmF0ZSBfY29sbGlzaW9uKHRhaWw6IFRIUkVFLlZlY3RvcjMpOiB2b2lkIHtcbiAgICB0aGlzLmNvbGxpZGVyR3JvdXBzLmZvckVhY2goKGNvbGxpZGVyR3JvdXApID0+IHtcbiAgICAgIGNvbGxpZGVyR3JvdXAuY29sbGlkZXJzLmZvckVhY2goKGNvbGxpZGVyKSA9PiB7XG4gICAgICAgIGNvbnN0IGRpc3QgPSBjb2xsaWRlci5zaGFwZS5jYWxjdWxhdGVDb2xsaXNpb24oY29sbGlkZXIubWF0cml4V29ybGQsIHRhaWwsIHRoaXMuc2V0dGluZ3MuaGl0UmFkaXVzLCBfdjNBKTtcblxuICAgICAgICBpZiAoZGlzdCA8IDAuMCkge1xuICAgICAgICAgIC8vIGhpdFxuICAgICAgICAgIHRhaWwuYWRkKF92M0EubXVsdGlwbHlTY2FsYXIoLWRpc3QpKTtcblxuICAgICAgICAgIC8vIG5vcm1hbGl6ZSBib25lIGxlbmd0aFxuICAgICAgICAgIHRhaWwuc3ViKF93b3JsZFNwYWNlUG9zaXRpb24pLm5vcm1hbGl6ZSgpLm11bHRpcGx5U2NhbGFyKHRoaXMuX3dvcmxkU3BhY2VCb25lTGVuZ3RoKS5hZGQoX3dvcmxkU3BhY2VQb3NpdGlvbik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG1hdHJpeCB0aGF0IGNvbnZlcnRzIGNlbnRlciBzcGFjZSBpbnRvIHdvcmxkIHNwYWNlLlxuICAgKiBAcGFyYW0gdGFyZ2V0IFRhcmdldCBtYXRyaXhcbiAgICovXG4gIHByaXZhdGUgX2dldE1hdHJpeENlbnRlclRvV29ybGQodGFyZ2V0OiBUSFJFRS5NYXRyaXg0KTogVEhSRUUuTWF0cml4NCB7XG4gICAgaWYgKHRoaXMuX2NlbnRlcikge1xuICAgICAgdGFyZ2V0LmNvcHkodGhpcy5fY2VudGVyLm1hdHJpeFdvcmxkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGFyZ2V0LmlkZW50aXR5KCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRhcmdldDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBtYXRyaXggdGhhdCBjb252ZXJ0cyB3b3JsZCBzcGFjZSBpbnRvIGNlbnRlciBzcGFjZS5cbiAgICogQHBhcmFtIHRhcmdldCBUYXJnZXQgbWF0cml4XG4gICAqL1xuICBwcml2YXRlIF9nZXRNYXRyaXhXb3JsZFRvQ2VudGVyKHRhcmdldDogVEhSRUUuTWF0cml4NCk6IFRIUkVFLk1hdHJpeDQge1xuICAgIGlmICh0aGlzLl9jZW50ZXIpIHtcbiAgICAgIHRhcmdldC5jb3B5KCh0aGlzLl9jZW50ZXIudXNlckRhdGEuaW52ZXJzZUNhY2hlUHJveHkgYXMgTWF0cml4NEludmVyc2VDYWNoZSkuaW52ZXJzZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRhcmdldC5pZGVudGl0eSgpO1xuICAgIH1cblxuICAgIHJldHVybiB0YXJnZXQ7XG4gIH1cbn1cbiIsIi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uXHJcblxyXG5QZXJtaXNzaW9uIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBhbmQvb3IgZGlzdHJpYnV0ZSB0aGlzIHNvZnR3YXJlIGZvciBhbnlcclxucHVycG9zZSB3aXRoIG9yIHdpdGhvdXQgZmVlIGlzIGhlcmVieSBncmFudGVkLlxyXG5cclxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiBBTkQgVEhFIEFVVEhPUiBESVNDTEFJTVMgQUxMIFdBUlJBTlRJRVMgV0lUSFxyXG5SRUdBUkQgVE8gVEhJUyBTT0ZUV0FSRSBJTkNMVURJTkcgQUxMIElNUExJRUQgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFlcclxuQU5EIEZJVE5FU1MuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1IgQkUgTElBQkxFIEZPUiBBTlkgU1BFQ0lBTCwgRElSRUNULFxyXG5JTkRJUkVDVCwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTIE9SIEFOWSBEQU1BR0VTIFdIQVRTT0VWRVIgUkVTVUxUSU5HIEZST01cclxuTE9TUyBPRiBVU0UsIERBVEEgT1IgUFJPRklUUywgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIE5FR0xJR0VOQ0UgT1JcclxuT1RIRVIgVE9SVElPVVMgQUNUSU9OLCBBUklTSU5HIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFVTRSBPUlxyXG5QRVJGT1JNQU5DRSBPRiBUSElTIFNPRlRXQVJFLlxyXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xyXG4vKiBnbG9iYWwgUmVmbGVjdCwgUHJvbWlzZSAqL1xyXG5cclxudmFyIGV4dGVuZFN0YXRpY3MgPSBmdW5jdGlvbihkLCBiKSB7XHJcbiAgICBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XHJcbiAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxyXG4gICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChiLCBwKSkgZFtwXSA9IGJbcF07IH07XHJcbiAgICByZXR1cm4gZXh0ZW5kU3RhdGljcyhkLCBiKTtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2V4dGVuZHMoZCwgYikge1xyXG4gICAgaWYgKHR5cGVvZiBiICE9PSBcImZ1bmN0aW9uXCIgJiYgYiAhPT0gbnVsbClcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2xhc3MgZXh0ZW5kcyB2YWx1ZSBcIiArIFN0cmluZyhiKSArIFwiIGlzIG5vdCBhIGNvbnN0cnVjdG9yIG9yIG51bGxcIik7XHJcbiAgICBleHRlbmRTdGF0aWNzKGQsIGIpO1xyXG4gICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XHJcbiAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XHJcbn1cclxuXHJcbmV4cG9ydCB2YXIgX19hc3NpZ24gPSBmdW5jdGlvbigpIHtcclxuICAgIF9fYXNzaWduID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiBfX2Fzc2lnbih0KSB7XHJcbiAgICAgICAgZm9yICh2YXIgcywgaSA9IDEsIG4gPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XHJcbiAgICAgICAgICAgIHMgPSBhcmd1bWVudHNbaV07XHJcbiAgICAgICAgICAgIGZvciAodmFyIHAgaW4gcykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzLCBwKSkgdFtwXSA9IHNbcF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIF9fYXNzaWduLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3Jlc3QocywgZSkge1xyXG4gICAgdmFyIHQgPSB7fTtcclxuICAgIGZvciAodmFyIHAgaW4gcykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzLCBwKSAmJiBlLmluZGV4T2YocCkgPCAwKVxyXG4gICAgICAgIHRbcF0gPSBzW3BdO1xyXG4gICAgaWYgKHMgIT0gbnVsbCAmJiB0eXBlb2YgT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyA9PT0gXCJmdW5jdGlvblwiKVxyXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBwID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhzKTsgaSA8IHAubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKGUuaW5kZXhPZihwW2ldKSA8IDAgJiYgT2JqZWN0LnByb3RvdHlwZS5wcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKHMsIHBbaV0pKVxyXG4gICAgICAgICAgICAgICAgdFtwW2ldXSA9IHNbcFtpXV07XHJcbiAgICAgICAgfVxyXG4gICAgcmV0dXJuIHQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2RlY29yYXRlKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKSB7XHJcbiAgICB2YXIgYyA9IGFyZ3VtZW50cy5sZW5ndGgsIHIgPSBjIDwgMyA/IHRhcmdldCA6IGRlc2MgPT09IG51bGwgPyBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIGtleSkgOiBkZXNjLCBkO1xyXG4gICAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBSZWZsZWN0LmRlY29yYXRlID09PSBcImZ1bmN0aW9uXCIpIHIgPSBSZWZsZWN0LmRlY29yYXRlKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKTtcclxuICAgIGVsc2UgZm9yICh2YXIgaSA9IGRlY29yYXRvcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIGlmIChkID0gZGVjb3JhdG9yc1tpXSkgciA9IChjIDwgMyA/IGQocikgOiBjID4gMyA/IGQodGFyZ2V0LCBrZXksIHIpIDogZCh0YXJnZXQsIGtleSkpIHx8IHI7XHJcbiAgICByZXR1cm4gYyA+IDMgJiYgciAmJiBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIHIpLCByO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19wYXJhbShwYXJhbUluZGV4LCBkZWNvcmF0b3IpIHtcclxuICAgIHJldHVybiBmdW5jdGlvbiAodGFyZ2V0LCBrZXkpIHsgZGVjb3JhdG9yKHRhcmdldCwga2V5LCBwYXJhbUluZGV4KTsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19tZXRhZGF0YShtZXRhZGF0YUtleSwgbWV0YWRhdGFWYWx1ZSkge1xyXG4gICAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBSZWZsZWN0Lm1ldGFkYXRhID09PSBcImZ1bmN0aW9uXCIpIHJldHVybiBSZWZsZWN0Lm1ldGFkYXRhKG1ldGFkYXRhS2V5LCBtZXRhZGF0YVZhbHVlKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXdhaXRlcih0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcclxuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxyXG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxyXG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxyXG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XHJcbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2dlbmVyYXRvcih0aGlzQXJnLCBib2R5KSB7XHJcbiAgICB2YXIgXyA9IHsgbGFiZWw6IDAsIHNlbnQ6IGZ1bmN0aW9uKCkgeyBpZiAodFswXSAmIDEpIHRocm93IHRbMV07IHJldHVybiB0WzFdOyB9LCB0cnlzOiBbXSwgb3BzOiBbXSB9LCBmLCB5LCB0LCBnO1xyXG4gICAgcmV0dXJuIGcgPSB7IG5leHQ6IHZlcmIoMCksIFwidGhyb3dcIjogdmVyYigxKSwgXCJyZXR1cm5cIjogdmVyYigyKSB9LCB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgKGdbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpczsgfSksIGc7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgcmV0dXJuIGZ1bmN0aW9uICh2KSB7IHJldHVybiBzdGVwKFtuLCB2XSk7IH07IH1cclxuICAgIGZ1bmN0aW9uIHN0ZXAob3ApIHtcclxuICAgICAgICBpZiAoZikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkdlbmVyYXRvciBpcyBhbHJlYWR5IGV4ZWN1dGluZy5cIik7XHJcbiAgICAgICAgd2hpbGUgKF8pIHRyeSB7XHJcbiAgICAgICAgICAgIGlmIChmID0gMSwgeSAmJiAodCA9IG9wWzBdICYgMiA/IHlbXCJyZXR1cm5cIl0gOiBvcFswXSA/IHlbXCJ0aHJvd1wiXSB8fCAoKHQgPSB5W1wicmV0dXJuXCJdKSAmJiB0LmNhbGwoeSksIDApIDogeS5uZXh0KSAmJiAhKHQgPSB0LmNhbGwoeSwgb3BbMV0pKS5kb25lKSByZXR1cm4gdDtcclxuICAgICAgICAgICAgaWYgKHkgPSAwLCB0KSBvcCA9IFtvcFswXSAmIDIsIHQudmFsdWVdO1xyXG4gICAgICAgICAgICBzd2l0Y2ggKG9wWzBdKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDA6IGNhc2UgMTogdCA9IG9wOyBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgNDogXy5sYWJlbCsrOyByZXR1cm4geyB2YWx1ZTogb3BbMV0sIGRvbmU6IGZhbHNlIH07XHJcbiAgICAgICAgICAgICAgICBjYXNlIDU6IF8ubGFiZWwrKzsgeSA9IG9wWzFdOyBvcCA9IFswXTsgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDc6IG9wID0gXy5vcHMucG9wKCk7IF8udHJ5cy5wb3AoKTsgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghKHQgPSBfLnRyeXMsIHQgPSB0Lmxlbmd0aCA+IDAgJiYgdFt0Lmxlbmd0aCAtIDFdKSAmJiAob3BbMF0gPT09IDYgfHwgb3BbMF0gPT09IDIpKSB7IF8gPSAwOyBjb250aW51ZTsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvcFswXSA9PT0gMyAmJiAoIXQgfHwgKG9wWzFdID4gdFswXSAmJiBvcFsxXSA8IHRbM10pKSkgeyBfLmxhYmVsID0gb3BbMV07IGJyZWFrOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSA2ICYmIF8ubGFiZWwgPCB0WzFdKSB7IF8ubGFiZWwgPSB0WzFdOyB0ID0gb3A7IGJyZWFrOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHQgJiYgXy5sYWJlbCA8IHRbMl0pIHsgXy5sYWJlbCA9IHRbMl07IF8ub3BzLnB1c2gob3ApOyBicmVhazsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0WzJdKSBfLm9wcy5wb3AoKTtcclxuICAgICAgICAgICAgICAgICAgICBfLnRyeXMucG9wKCk7IGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG9wID0gYm9keS5jYWxsKHRoaXNBcmcsIF8pO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHsgb3AgPSBbNiwgZV07IHkgPSAwOyB9IGZpbmFsbHkgeyBmID0gdCA9IDA7IH1cclxuICAgICAgICBpZiAob3BbMF0gJiA1KSB0aHJvdyBvcFsxXTsgcmV0dXJuIHsgdmFsdWU6IG9wWzBdID8gb3BbMV0gOiB2b2lkIDAsIGRvbmU6IHRydWUgfTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IHZhciBfX2NyZWF0ZUJpbmRpbmcgPSBPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XHJcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xyXG4gICAgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG0sIGspO1xyXG4gICAgaWYgKCFkZXNjIHx8IChcImdldFwiIGluIGRlc2MgPyAhbS5fX2VzTW9kdWxlIDogZGVzYy53cml0YWJsZSB8fCBkZXNjLmNvbmZpZ3VyYWJsZSkpIHtcclxuICAgICAgICBkZXNjID0geyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gbVtrXTsgfSB9O1xyXG4gICAgfVxyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIGsyLCBkZXNjKTtcclxufSkgOiAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcclxuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XHJcbiAgICBvW2syXSA9IG1ba107XHJcbn0pO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZXhwb3J0U3RhcihtLCBvKSB7XHJcbiAgICBmb3IgKHZhciBwIGluIG0pIGlmIChwICE9PSBcImRlZmF1bHRcIiAmJiAhT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG8sIHApKSBfX2NyZWF0ZUJpbmRpbmcobywgbSwgcCk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3ZhbHVlcyhvKSB7XHJcbiAgICB2YXIgcyA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBTeW1ib2wuaXRlcmF0b3IsIG0gPSBzICYmIG9bc10sIGkgPSAwO1xyXG4gICAgaWYgKG0pIHJldHVybiBtLmNhbGwobyk7XHJcbiAgICBpZiAobyAmJiB0eXBlb2Ygby5sZW5ndGggPT09IFwibnVtYmVyXCIpIHJldHVybiB7XHJcbiAgICAgICAgbmV4dDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAobyAmJiBpID49IG8ubGVuZ3RoKSBvID0gdm9pZCAwO1xyXG4gICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogbyAmJiBvW2krK10sIGRvbmU6ICFvIH07XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IocyA/IFwiT2JqZWN0IGlzIG5vdCBpdGVyYWJsZS5cIiA6IFwiU3ltYm9sLml0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcmVhZChvLCBuKSB7XHJcbiAgICB2YXIgbSA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvW1N5bWJvbC5pdGVyYXRvcl07XHJcbiAgICBpZiAoIW0pIHJldHVybiBvO1xyXG4gICAgdmFyIGkgPSBtLmNhbGwobyksIHIsIGFyID0gW10sIGU7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIHdoaWxlICgobiA9PT0gdm9pZCAwIHx8IG4tLSA+IDApICYmICEociA9IGkubmV4dCgpKS5kb25lKSBhci5wdXNoKHIudmFsdWUpO1xyXG4gICAgfVxyXG4gICAgY2F0Y2ggKGVycm9yKSB7IGUgPSB7IGVycm9yOiBlcnJvciB9OyB9XHJcbiAgICBmaW5hbGx5IHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBpZiAociAmJiAhci5kb25lICYmIChtID0gaVtcInJldHVyblwiXSkpIG0uY2FsbChpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZmluYWxseSB7IGlmIChlKSB0aHJvdyBlLmVycm9yOyB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYXI7XHJcbn1cclxuXHJcbi8qKiBAZGVwcmVjYXRlZCAqL1xyXG5leHBvcnQgZnVuY3Rpb24gX19zcHJlYWQoKSB7XHJcbiAgICBmb3IgKHZhciBhciA9IFtdLCBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKylcclxuICAgICAgICBhciA9IGFyLmNvbmNhdChfX3JlYWQoYXJndW1lbnRzW2ldKSk7XHJcbiAgICByZXR1cm4gYXI7XHJcbn1cclxuXHJcbi8qKiBAZGVwcmVjYXRlZCAqL1xyXG5leHBvcnQgZnVuY3Rpb24gX19zcHJlYWRBcnJheXMoKSB7XHJcbiAgICBmb3IgKHZhciBzID0gMCwgaSA9IDAsIGlsID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IGlsOyBpKyspIHMgKz0gYXJndW1lbnRzW2ldLmxlbmd0aDtcclxuICAgIGZvciAodmFyIHIgPSBBcnJheShzKSwgayA9IDAsIGkgPSAwOyBpIDwgaWw7IGkrKylcclxuICAgICAgICBmb3IgKHZhciBhID0gYXJndW1lbnRzW2ldLCBqID0gMCwgamwgPSBhLmxlbmd0aDsgaiA8IGpsOyBqKyssIGsrKylcclxuICAgICAgICAgICAgcltrXSA9IGFbal07XHJcbiAgICByZXR1cm4gcjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fc3ByZWFkQXJyYXkodG8sIGZyb20sIHBhY2spIHtcclxuICAgIGlmIChwYWNrIHx8IGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIGZvciAodmFyIGkgPSAwLCBsID0gZnJvbS5sZW5ndGgsIGFyOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgaWYgKGFyIHx8ICEoaSBpbiBmcm9tKSkge1xyXG4gICAgICAgICAgICBpZiAoIWFyKSBhciA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGZyb20sIDAsIGkpO1xyXG4gICAgICAgICAgICBhcltpXSA9IGZyb21baV07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRvLmNvbmNhdChhciB8fCBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChmcm9tKSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2F3YWl0KHYpIHtcclxuICAgIHJldHVybiB0aGlzIGluc3RhbmNlb2YgX19hd2FpdCA/ICh0aGlzLnYgPSB2LCB0aGlzKSA6IG5ldyBfX2F3YWl0KHYpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hc3luY0dlbmVyYXRvcih0aGlzQXJnLCBfYXJndW1lbnRzLCBnZW5lcmF0b3IpIHtcclxuICAgIGlmICghU3ltYm9sLmFzeW5jSXRlcmF0b3IpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTeW1ib2wuYXN5bmNJdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XHJcbiAgICB2YXIgZyA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSwgaSwgcSA9IFtdO1xyXG4gICAgcmV0dXJuIGkgPSB7fSwgdmVyYihcIm5leHRcIiksIHZlcmIoXCJ0aHJvd1wiKSwgdmVyYihcInJldHVyblwiKSwgaVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LCBpO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IGlmIChnW25dKSBpW25dID0gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChhLCBiKSB7IHEucHVzaChbbiwgdiwgYSwgYl0pID4gMSB8fCByZXN1bWUobiwgdik7IH0pOyB9OyB9XHJcbiAgICBmdW5jdGlvbiByZXN1bWUobiwgdikgeyB0cnkgeyBzdGVwKGdbbl0odikpOyB9IGNhdGNoIChlKSB7IHNldHRsZShxWzBdWzNdLCBlKTsgfSB9XHJcbiAgICBmdW5jdGlvbiBzdGVwKHIpIHsgci52YWx1ZSBpbnN0YW5jZW9mIF9fYXdhaXQgPyBQcm9taXNlLnJlc29sdmUoci52YWx1ZS52KS50aGVuKGZ1bGZpbGwsIHJlamVjdCkgOiBzZXR0bGUocVswXVsyXSwgcik7IH1cclxuICAgIGZ1bmN0aW9uIGZ1bGZpbGwodmFsdWUpIHsgcmVzdW1lKFwibmV4dFwiLCB2YWx1ZSk7IH1cclxuICAgIGZ1bmN0aW9uIHJlamVjdCh2YWx1ZSkgeyByZXN1bWUoXCJ0aHJvd1wiLCB2YWx1ZSk7IH1cclxuICAgIGZ1bmN0aW9uIHNldHRsZShmLCB2KSB7IGlmIChmKHYpLCBxLnNoaWZ0KCksIHEubGVuZ3RoKSByZXN1bWUocVswXVswXSwgcVswXVsxXSk7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXN5bmNEZWxlZ2F0b3Iobykge1xyXG4gICAgdmFyIGksIHA7XHJcbiAgICByZXR1cm4gaSA9IHt9LCB2ZXJiKFwibmV4dFwiKSwgdmVyYihcInRocm93XCIsIGZ1bmN0aW9uIChlKSB7IHRocm93IGU7IH0pLCB2ZXJiKFwicmV0dXJuXCIpLCBpW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LCBpO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuLCBmKSB7IGlbbl0gPSBvW25dID8gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIChwID0gIXApID8geyB2YWx1ZTogX19hd2FpdChvW25dKHYpKSwgZG9uZTogbiA9PT0gXCJyZXR1cm5cIiB9IDogZiA/IGYodikgOiB2OyB9IDogZjsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hc3luY1ZhbHVlcyhvKSB7XHJcbiAgICBpZiAoIVN5bWJvbC5hc3luY0l0ZXJhdG9yKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3ltYm9sLmFzeW5jSXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xyXG4gICAgdmFyIG0gPSBvW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSwgaTtcclxuICAgIHJldHVybiBtID8gbS5jYWxsKG8pIDogKG8gPSB0eXBlb2YgX192YWx1ZXMgPT09IFwiZnVuY3Rpb25cIiA/IF9fdmFsdWVzKG8pIDogb1tTeW1ib2wuaXRlcmF0b3JdKCksIGkgPSB7fSwgdmVyYihcIm5leHRcIiksIHZlcmIoXCJ0aHJvd1wiKSwgdmVyYihcInJldHVyblwiKSwgaVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LCBpKTtcclxuICAgIGZ1bmN0aW9uIHZlcmIobikgeyBpW25dID0gb1tuXSAmJiBmdW5jdGlvbiAodikgeyByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkgeyB2ID0gb1tuXSh2KSwgc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgdi5kb25lLCB2LnZhbHVlKTsgfSk7IH07IH1cclxuICAgIGZ1bmN0aW9uIHNldHRsZShyZXNvbHZlLCByZWplY3QsIGQsIHYpIHsgUHJvbWlzZS5yZXNvbHZlKHYpLnRoZW4oZnVuY3Rpb24odikgeyByZXNvbHZlKHsgdmFsdWU6IHYsIGRvbmU6IGQgfSk7IH0sIHJlamVjdCk7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fbWFrZVRlbXBsYXRlT2JqZWN0KGNvb2tlZCwgcmF3KSB7XHJcbiAgICBpZiAoT2JqZWN0LmRlZmluZVByb3BlcnR5KSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjb29rZWQsIFwicmF3XCIsIHsgdmFsdWU6IHJhdyB9KTsgfSBlbHNlIHsgY29va2VkLnJhdyA9IHJhdzsgfVxyXG4gICAgcmV0dXJuIGNvb2tlZDtcclxufTtcclxuXHJcbnZhciBfX3NldE1vZHVsZURlZmF1bHQgPSBPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIHYpIHtcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBcImRlZmF1bHRcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdiB9KTtcclxufSkgOiBmdW5jdGlvbihvLCB2KSB7XHJcbiAgICBvW1wiZGVmYXVsdFwiXSA9IHY7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19pbXBvcnRTdGFyKG1vZCkge1xyXG4gICAgaWYgKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgcmV0dXJuIG1vZDtcclxuICAgIHZhciByZXN1bHQgPSB7fTtcclxuICAgIGlmIChtb2QgIT0gbnVsbCkgZm9yICh2YXIgayBpbiBtb2QpIGlmIChrICE9PSBcImRlZmF1bHRcIiAmJiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobW9kLCBrKSkgX19jcmVhdGVCaW5kaW5nKHJlc3VsdCwgbW9kLCBrKTtcclxuICAgIF9fc2V0TW9kdWxlRGVmYXVsdChyZXN1bHQsIG1vZCk7XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19pbXBvcnREZWZhdWx0KG1vZCkge1xyXG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBkZWZhdWx0OiBtb2QgfTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fY2xhc3NQcml2YXRlRmllbGRHZXQocmVjZWl2ZXIsIHN0YXRlLCBraW5kLCBmKSB7XHJcbiAgICBpZiAoa2luZCA9PT0gXCJhXCIgJiYgIWYpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJQcml2YXRlIGFjY2Vzc29yIHdhcyBkZWZpbmVkIHdpdGhvdXQgYSBnZXR0ZXJcIik7XHJcbiAgICBpZiAodHlwZW9mIHN0YXRlID09PSBcImZ1bmN0aW9uXCIgPyByZWNlaXZlciAhPT0gc3RhdGUgfHwgIWYgOiAhc3RhdGUuaGFzKHJlY2VpdmVyKSkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCByZWFkIHByaXZhdGUgbWVtYmVyIGZyb20gYW4gb2JqZWN0IHdob3NlIGNsYXNzIGRpZCBub3QgZGVjbGFyZSBpdFwiKTtcclxuICAgIHJldHVybiBraW5kID09PSBcIm1cIiA/IGYgOiBraW5kID09PSBcImFcIiA/IGYuY2FsbChyZWNlaXZlcikgOiBmID8gZi52YWx1ZSA6IHN0YXRlLmdldChyZWNlaXZlcik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2NsYXNzUHJpdmF0ZUZpZWxkU2V0KHJlY2VpdmVyLCBzdGF0ZSwgdmFsdWUsIGtpbmQsIGYpIHtcclxuICAgIGlmIChraW5kID09PSBcIm1cIikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlByaXZhdGUgbWV0aG9kIGlzIG5vdCB3cml0YWJsZVwiKTtcclxuICAgIGlmIChraW5kID09PSBcImFcIiAmJiAhZikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlByaXZhdGUgYWNjZXNzb3Igd2FzIGRlZmluZWQgd2l0aG91dCBhIHNldHRlclwiKTtcclxuICAgIGlmICh0eXBlb2Ygc3RhdGUgPT09IFwiZnVuY3Rpb25cIiA/IHJlY2VpdmVyICE9PSBzdGF0ZSB8fCAhZiA6ICFzdGF0ZS5oYXMocmVjZWl2ZXIpKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IHdyaXRlIHByaXZhdGUgbWVtYmVyIHRvIGFuIG9iamVjdCB3aG9zZSBjbGFzcyBkaWQgbm90IGRlY2xhcmUgaXRcIik7XHJcbiAgICByZXR1cm4gKGtpbmQgPT09IFwiYVwiID8gZi5jYWxsKHJlY2VpdmVyLCB2YWx1ZSkgOiBmID8gZi52YWx1ZSA9IHZhbHVlIDogc3RhdGUuc2V0KHJlY2VpdmVyLCB2YWx1ZSkpLCB2YWx1ZTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fY2xhc3NQcml2YXRlRmllbGRJbihzdGF0ZSwgcmVjZWl2ZXIpIHtcclxuICAgIGlmIChyZWNlaXZlciA9PT0gbnVsbCB8fCAodHlwZW9mIHJlY2VpdmVyICE9PSBcIm9iamVjdFwiICYmIHR5cGVvZiByZWNlaXZlciAhPT0gXCJmdW5jdGlvblwiKSkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCB1c2UgJ2luJyBvcGVyYXRvciBvbiBub24tb2JqZWN0XCIpO1xyXG4gICAgcmV0dXJuIHR5cGVvZiBzdGF0ZSA9PT0gXCJmdW5jdGlvblwiID8gcmVjZWl2ZXIgPT09IHN0YXRlIDogc3RhdGUuaGFzKHJlY2VpdmVyKTtcclxufVxyXG4iLCJpbXBvcnQgdHlwZSAqIGFzIFRIUkVFIGZyb20gJ3RocmVlJztcblxuZXhwb3J0IGZ1bmN0aW9uIHRyYXZlcnNlQW5jZXN0b3JzRnJvbVJvb3Qob2JqZWN0OiBUSFJFRS5PYmplY3QzRCwgY2FsbGJhY2s6IChvYmplY3Q6IFRIUkVFLk9iamVjdDNEKSA9PiB2b2lkKTogdm9pZCB7XG4gIGNvbnN0IGFuY2VzdG9yczogVEhSRUUuT2JqZWN0M0RbXSA9IFtdO1xuXG4gIGxldCBoZWFkOiBUSFJFRS5PYmplY3QzRCB8IG51bGwgPSBvYmplY3Q7XG4gIHdoaWxlIChoZWFkICE9PSBudWxsKSB7XG4gICAgYW5jZXN0b3JzLnVuc2hpZnQoaGVhZCk7XG4gICAgaGVhZCA9IGhlYWQucGFyZW50O1xuICB9XG5cbiAgYW5jZXN0b3JzLmZvckVhY2goKGFuY2VzdG9yKSA9PiB7XG4gICAgY2FsbGJhY2soYW5jZXN0b3IpO1xuICB9KTtcbn1cbiIsIi8qKlxuICogVHJhdmVyc2UgY2hpbGRyZW4gb2YgZ2l2ZW4gb2JqZWN0IGFuZCBleGVjdXRlIGdpdmVuIGNhbGxiYWNrLlxuICogVGhlIGdpdmVuIG9iamVjdCBpdHNlbGYgd29udCBiZSBnaXZlbiB0byB0aGUgY2FsbGJhY2suXG4gKiBJZiB0aGUgcmV0dXJuIHZhbHVlIG9mIHRoZSBjYWxsYmFjayBpcyBgdHJ1ZWAsIGl0IHdpbGwgaGFsdCB0aGUgdHJhdmVyc2FsIG9mIGl0cyBjaGlsZHJlbi5cbiAqIEBwYXJhbSBvYmplY3QgQSByb290IG9iamVjdFxuICogQHBhcmFtIGNhbGxiYWNrIEEgY2FsbGJhY2sgZnVuY3Rpb24gY2FsbGVkIGZvciBlYWNoIGNoaWxkcmVuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmF2ZXJzZUNoaWxkcmVuVW50aWxDb25kaXRpb25NZXQoXG4gIG9iamVjdDogVEhSRUUuT2JqZWN0M0QsXG4gIGNhbGxiYWNrOiAob2JqZWN0OiBUSFJFRS5PYmplY3QzRCkgPT4gYm9vbGVhbixcbik6IHZvaWQge1xuICBvYmplY3QuY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGQpID0+IHtcbiAgICBjb25zdCByZXN1bHQgPSBjYWxsYmFjayhjaGlsZCk7XG4gICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgIHRyYXZlcnNlQ2hpbGRyZW5VbnRpbENvbmRpdGlvbk1ldChjaGlsZCwgY2FsbGJhY2spO1xuICAgIH1cbiAgfSk7XG59XG4iLCJpbXBvcnQgdHlwZSAqIGFzIFRIUkVFIGZyb20gJ3RocmVlJztcbmltcG9ydCB0eXBlIHsgVlJNU3ByaW5nQm9uZUpvaW50IH0gZnJvbSAnLi9WUk1TcHJpbmdCb25lSm9pbnQnO1xuaW1wb3J0IHsgdHJhdmVyc2VBbmNlc3RvcnNGcm9tUm9vdCB9IGZyb20gJy4vdXRpbHMvdHJhdmVyc2VBbmNlc3RvcnNGcm9tUm9vdCc7XG5pbXBvcnQgdHlwZSB7IFZSTVNwcmluZ0JvbmVDb2xsaWRlciB9IGZyb20gJy4vVlJNU3ByaW5nQm9uZUNvbGxpZGVyJztcbmltcG9ydCB0eXBlIHsgVlJNU3ByaW5nQm9uZUNvbGxpZGVyR3JvdXAgfSBmcm9tICcuL1ZSTVNwcmluZ0JvbmVDb2xsaWRlckdyb3VwJztcbmltcG9ydCB7IHRyYXZlcnNlQ2hpbGRyZW5VbnRpbENvbmRpdGlvbk1ldCB9IGZyb20gJy4vdXRpbHMvdHJhdmVyc2VDaGlsZHJlblVudGlsQ29uZGl0aW9uTWV0JztcblxuZXhwb3J0IGNsYXNzIFZSTVNwcmluZ0JvbmVNYW5hZ2VyIHtcbiAgcHJpdmF0ZSBfam9pbnRzID0gbmV3IFNldDxWUk1TcHJpbmdCb25lSm9pbnQ+KCk7XG4gIHB1YmxpYyBnZXQgam9pbnRzKCk6IFNldDxWUk1TcHJpbmdCb25lSm9pbnQ+IHtcbiAgICByZXR1cm4gdGhpcy5fam9pbnRzO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkIFVzZSB7QGxpbmsgam9pbnRzfSBpbnN0ZWFkLlxuICAgKi9cbiAgcHVibGljIGdldCBzcHJpbmdCb25lcygpOiBTZXQ8VlJNU3ByaW5nQm9uZUpvaW50PiB7XG4gICAgY29uc29sZS53YXJuKCdWUk1TcHJpbmdCb25lTWFuYWdlcjogc3ByaW5nQm9uZXMgaXMgZGVwcmVjYXRlZC4gdXNlIGpvaW50cyBpbnN0ZWFkLicpO1xuXG4gICAgcmV0dXJuIHRoaXMuX2pvaW50cztcbiAgfVxuXG4gIHB1YmxpYyBnZXQgY29sbGlkZXJHcm91cHMoKTogVlJNU3ByaW5nQm9uZUNvbGxpZGVyR3JvdXBbXSB7XG4gICAgY29uc3Qgc2V0ID0gbmV3IFNldDxWUk1TcHJpbmdCb25lQ29sbGlkZXJHcm91cD4oKTtcbiAgICB0aGlzLl9qb2ludHMuZm9yRWFjaCgoc3ByaW5nQm9uZSkgPT4ge1xuICAgICAgc3ByaW5nQm9uZS5jb2xsaWRlckdyb3Vwcy5mb3JFYWNoKChjb2xsaWRlckdyb3VwKSA9PiB7XG4gICAgICAgIHNldC5hZGQoY29sbGlkZXJHcm91cCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gQXJyYXkuZnJvbShzZXQpO1xuICB9XG5cbiAgcHVibGljIGdldCBjb2xsaWRlcnMoKTogVlJNU3ByaW5nQm9uZUNvbGxpZGVyW10ge1xuICAgIGNvbnN0IHNldCA9IG5ldyBTZXQ8VlJNU3ByaW5nQm9uZUNvbGxpZGVyPigpO1xuICAgIHRoaXMuY29sbGlkZXJHcm91cHMuZm9yRWFjaCgoY29sbGlkZXJHcm91cCkgPT4ge1xuICAgICAgY29sbGlkZXJHcm91cC5jb2xsaWRlcnMuZm9yRWFjaCgoY29sbGlkZXIpID0+IHtcbiAgICAgICAgc2V0LmFkZChjb2xsaWRlcik7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gQXJyYXkuZnJvbShzZXQpO1xuICB9XG5cbiAgcHJpdmF0ZSBfb2JqZWN0U3ByaW5nQm9uZXNNYXAgPSBuZXcgTWFwPFRIUkVFLk9iamVjdDNELCBTZXQ8VlJNU3ByaW5nQm9uZUpvaW50Pj4oKTtcblxuICBwdWJsaWMgYWRkSm9pbnQoam9pbnQ6IFZSTVNwcmluZ0JvbmVKb2ludCk6IHZvaWQge1xuICAgIHRoaXMuX2pvaW50cy5hZGQoam9pbnQpO1xuXG4gICAgbGV0IG9iamVjdFNldCA9IHRoaXMuX29iamVjdFNwcmluZ0JvbmVzTWFwLmdldChqb2ludC5ib25lKTtcbiAgICBpZiAob2JqZWN0U2V0ID09IG51bGwpIHtcbiAgICAgIG9iamVjdFNldCA9IG5ldyBTZXQ8VlJNU3ByaW5nQm9uZUpvaW50PigpO1xuICAgICAgdGhpcy5fb2JqZWN0U3ByaW5nQm9uZXNNYXAuc2V0KGpvaW50LmJvbmUsIG9iamVjdFNldCk7XG4gICAgfVxuICAgIG9iamVjdFNldC5hZGQoam9pbnQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkIFVzZSB7QGxpbmsgYWRkSm9pbnR9IGluc3RlYWQuXG4gICAqL1xuICBwdWJsaWMgYWRkU3ByaW5nQm9uZShqb2ludDogVlJNU3ByaW5nQm9uZUpvaW50KTogdm9pZCB7XG4gICAgY29uc29sZS53YXJuKCdWUk1TcHJpbmdCb25lTWFuYWdlcjogYWRkU3ByaW5nQm9uZSgpIGlzIGRlcHJlY2F0ZWQuIHVzZSBhZGRKb2ludCgpIGluc3RlYWQuJyk7XG5cbiAgICB0aGlzLmFkZEpvaW50KGpvaW50KTtcbiAgfVxuXG4gIHB1YmxpYyBkZWxldGVKb2ludChqb2ludDogVlJNU3ByaW5nQm9uZUpvaW50KTogdm9pZCB7XG4gICAgdGhpcy5fam9pbnRzLmRlbGV0ZShqb2ludCk7XG5cbiAgICBjb25zdCBvYmplY3RTZXQgPSB0aGlzLl9vYmplY3RTcHJpbmdCb25lc01hcC5nZXQoam9pbnQuYm9uZSkhO1xuICAgIG9iamVjdFNldC5kZWxldGUoam9pbnQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkIFVzZSB7QGxpbmsgZGVsZXRlSm9pbnR9IGluc3RlYWQuXG4gICAqL1xuICBwdWJsaWMgZGVsZXRlU3ByaW5nQm9uZShqb2ludDogVlJNU3ByaW5nQm9uZUpvaW50KTogdm9pZCB7XG4gICAgY29uc29sZS53YXJuKCdWUk1TcHJpbmdCb25lTWFuYWdlcjogZGVsZXRlU3ByaW5nQm9uZSgpIGlzIGRlcHJlY2F0ZWQuIHVzZSBkZWxldGVKb2ludCgpIGluc3RlYWQuJyk7XG5cbiAgICB0aGlzLmRlbGV0ZUpvaW50KGpvaW50KTtcbiAgfVxuXG4gIHB1YmxpYyBzZXRJbml0U3RhdGUoKTogdm9pZCB7XG4gICAgY29uc3Qgc3ByaW5nQm9uZXNUcmllZCA9IG5ldyBTZXQ8VlJNU3ByaW5nQm9uZUpvaW50PigpO1xuICAgIGNvbnN0IHNwcmluZ0JvbmVzRG9uZSA9IG5ldyBTZXQ8VlJNU3ByaW5nQm9uZUpvaW50PigpO1xuICAgIGNvbnN0IG9iamVjdFVwZGF0ZWQgPSBuZXcgU2V0PFRIUkVFLk9iamVjdDNEPigpO1xuXG4gICAgZm9yIChjb25zdCBzcHJpbmdCb25lIG9mIHRoaXMuX2pvaW50cykge1xuICAgICAgdGhpcy5fcHJvY2Vzc1NwcmluZ0JvbmUoc3ByaW5nQm9uZSwgc3ByaW5nQm9uZXNUcmllZCwgc3ByaW5nQm9uZXNEb25lLCBvYmplY3RVcGRhdGVkLCAoc3ByaW5nQm9uZSkgPT5cbiAgICAgICAgc3ByaW5nQm9uZS5zZXRJbml0U3RhdGUoKSxcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xuICAgIGNvbnN0IHNwcmluZ0JvbmVzVHJpZWQgPSBuZXcgU2V0PFZSTVNwcmluZ0JvbmVKb2ludD4oKTtcbiAgICBjb25zdCBzcHJpbmdCb25lc0RvbmUgPSBuZXcgU2V0PFZSTVNwcmluZ0JvbmVKb2ludD4oKTtcbiAgICBjb25zdCBvYmplY3RVcGRhdGVkID0gbmV3IFNldDxUSFJFRS5PYmplY3QzRD4oKTtcblxuICAgIGZvciAoY29uc3Qgc3ByaW5nQm9uZSBvZiB0aGlzLl9qb2ludHMpIHtcbiAgICAgIHRoaXMuX3Byb2Nlc3NTcHJpbmdCb25lKHNwcmluZ0JvbmUsIHNwcmluZ0JvbmVzVHJpZWQsIHNwcmluZ0JvbmVzRG9uZSwgb2JqZWN0VXBkYXRlZCwgKHNwcmluZ0JvbmUpID0+XG4gICAgICAgIHNwcmluZ0JvbmUucmVzZXQoKSxcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHVwZGF0ZShkZWx0YTogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3Qgc3ByaW5nQm9uZXNUcmllZCA9IG5ldyBTZXQ8VlJNU3ByaW5nQm9uZUpvaW50PigpO1xuICAgIGNvbnN0IHNwcmluZ0JvbmVzRG9uZSA9IG5ldyBTZXQ8VlJNU3ByaW5nQm9uZUpvaW50PigpO1xuICAgIGNvbnN0IG9iamVjdFVwZGF0ZWQgPSBuZXcgU2V0PFRIUkVFLk9iamVjdDNEPigpO1xuXG4gICAgZm9yIChjb25zdCBzcHJpbmdCb25lIG9mIHRoaXMuX2pvaW50cykge1xuICAgICAgLy8gdXBkYXRlIHRoZSBzcHJpbmdib25lXG4gICAgICB0aGlzLl9wcm9jZXNzU3ByaW5nQm9uZShzcHJpbmdCb25lLCBzcHJpbmdCb25lc1RyaWVkLCBzcHJpbmdCb25lc0RvbmUsIG9iamVjdFVwZGF0ZWQsIChzcHJpbmdCb25lKSA9PlxuICAgICAgICBzcHJpbmdCb25lLnVwZGF0ZShkZWx0YSksXG4gICAgICApO1xuXG4gICAgICAvLyB1cGRhdGUgY2hpbGRyZW4gd29ybGQgbWF0cmljZXNcbiAgICAgIC8vIGl0IGlzIHJlcXVpcmVkIHdoZW4gdGhlIHNwcmluZyBib25lIGNoYWluIGlzIHNwYXJzZVxuICAgICAgdHJhdmVyc2VDaGlsZHJlblVudGlsQ29uZGl0aW9uTWV0KHNwcmluZ0JvbmUuYm9uZSwgKG9iamVjdCkgPT4ge1xuICAgICAgICAvLyBpZiB0aGUgb2JqZWN0IGhhcyBhdHRhY2hlZCBzcHJpbmdib25lLCBoYWx0IHRoZSB0cmF2ZXJzYWxcbiAgICAgICAgaWYgKCh0aGlzLl9vYmplY3RTcHJpbmdCb25lc01hcC5nZXQob2JqZWN0KT8uc2l6ZSA/PyAwKSA+IDApIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG90aGVyd2lzZSB1cGRhdGUgaXRzIHdvcmxkIG1hdHJpeFxuICAgICAgICBvYmplY3QudXBkYXRlV29ybGRNYXRyaXgoZmFsc2UsIGZhbHNlKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSBhIHNwcmluZyBib25lLlxuICAgKiBJZiB0aGVyZSBhcmUgb3RoZXIgc3ByaW5nIGJvbmUgdGhhdCBhcmUgZGVwZW5kYW50LCBpdCB3aWxsIHRyeSB0byB1cGRhdGUgdGhlbSByZWN1cnNpdmVseS5cbiAgICogSXQgdXBkYXRlcyBtYXRyaXhXb3JsZCBvZiBhbGwgYW5jZXN0b3JzIGFuZCBteXNlbGYuXG4gICAqIEl0IG1pZ2h0IHRocm93IGFuIGVycm9yIGlmIHRoZXJlIGFyZSBjaXJjdWxhciBkZXBlbmRlbmNpZXMuXG4gICAqXG4gICAqIEludGVuZGVkIHRvIGJlIHVzZWQgaW4ge0BsaW5rIHVwZGF0ZX0gYW5kIHtAbGluayBfcHJvY2Vzc1NwcmluZ0JvbmV9IGl0c2VsZiByZWN1cnNpdmVseS5cbiAgICpcbiAgICogQHBhcmFtIHNwcmluZ0JvbmUgQSBzcHJpbmdCb25lIHlvdSB3YW50IHRvIHVwZGF0ZVxuICAgKiBAcGFyYW0gc3ByaW5nQm9uZXNUcmllZCBTZXQgb2Ygc3ByaW5nQm9uZXMgdGhhdCBhcmUgYWxyZWFkeSB0cmllZCB0byBiZSB1cGRhdGVkXG4gICAqIEBwYXJhbSBzcHJpbmdCb25lc0RvbmUgU2V0IG9mIHNwcmluZ0JvbmVzIHRoYXQgYXJlIGFscmVhZHkgdXAgdG8gZGF0ZVxuICAgKiBAcGFyYW0gb2JqZWN0VXBkYXRlZCBTZXQgb2Ygb2JqZWN0M0Qgd2hvc2UgbWF0cml4V29ybGQgaXMgdXBkYXRlZFxuICAgKi9cbiAgcHJpdmF0ZSBfcHJvY2Vzc1NwcmluZ0JvbmUoXG4gICAgc3ByaW5nQm9uZTogVlJNU3ByaW5nQm9uZUpvaW50LFxuICAgIHNwcmluZ0JvbmVzVHJpZWQ6IFNldDxWUk1TcHJpbmdCb25lSm9pbnQ+LFxuICAgIHNwcmluZ0JvbmVzRG9uZTogU2V0PFZSTVNwcmluZ0JvbmVKb2ludD4sXG4gICAgb2JqZWN0VXBkYXRlZDogU2V0PFRIUkVFLk9iamVjdDNEPixcbiAgICBjYWxsYmFjazogKHNwcmluZ0JvbmU6IFZSTVNwcmluZ0JvbmVKb2ludCkgPT4gdm9pZCxcbiAgKTogdm9pZCB7XG4gICAgaWYgKHNwcmluZ0JvbmVzRG9uZS5oYXMoc3ByaW5nQm9uZSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoc3ByaW5nQm9uZXNUcmllZC5oYXMoc3ByaW5nQm9uZSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVlJNU3ByaW5nQm9uZU1hbmFnZXI6IENpcmN1bGFyIGRlcGVuZGVuY3kgZGV0ZWN0ZWQgd2hpbGUgdXBkYXRpbmcgc3ByaW5nYm9uZXMnKTtcbiAgICB9XG4gICAgc3ByaW5nQm9uZXNUcmllZC5hZGQoc3ByaW5nQm9uZSk7XG5cbiAgICBjb25zdCBkZXBPYmplY3RzID0gdGhpcy5fZ2V0RGVwZW5kZW5jaWVzKHNwcmluZ0JvbmUpO1xuICAgIGZvciAoY29uc3QgZGVwT2JqZWN0IG9mIGRlcE9iamVjdHMpIHtcbiAgICAgIHRyYXZlcnNlQW5jZXN0b3JzRnJvbVJvb3QoZGVwT2JqZWN0LCAoZGVwT2JqZWN0QW5jZXN0b3IpID0+IHtcbiAgICAgICAgY29uc3Qgb2JqZWN0U2V0ID0gdGhpcy5fb2JqZWN0U3ByaW5nQm9uZXNNYXAuZ2V0KGRlcE9iamVjdEFuY2VzdG9yKTtcbiAgICAgICAgaWYgKG9iamVjdFNldCkge1xuICAgICAgICAgIGZvciAoY29uc3QgZGVwU3ByaW5nQm9uZSBvZiBvYmplY3RTZXQpIHtcbiAgICAgICAgICAgIHRoaXMuX3Byb2Nlc3NTcHJpbmdCb25lKGRlcFNwcmluZ0JvbmUsIHNwcmluZ0JvbmVzVHJpZWQsIHNwcmluZ0JvbmVzRG9uZSwgb2JqZWN0VXBkYXRlZCwgY2FsbGJhY2spO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICghb2JqZWN0VXBkYXRlZC5oYXMoZGVwT2JqZWN0QW5jZXN0b3IpKSB7XG4gICAgICAgICAgLy8gdXBkYXRlIG1hdHJpeCBvZiBub24tc3ByaW5nYm9uZVxuICAgICAgICAgIGRlcE9iamVjdEFuY2VzdG9yLnVwZGF0ZVdvcmxkTWF0cml4KGZhbHNlLCBmYWxzZSk7XG4gICAgICAgICAgb2JqZWN0VXBkYXRlZC5hZGQoZGVwT2JqZWN0QW5jZXN0b3IpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyB1cGRhdGUgbXkgbWF0cml4XG4gICAgc3ByaW5nQm9uZS5ib25lLnVwZGF0ZU1hdHJpeCgpO1xuICAgIHNwcmluZ0JvbmUuYm9uZS51cGRhdGVXb3JsZE1hdHJpeChmYWxzZSwgZmFsc2UpO1xuXG4gICAgY2FsbGJhY2soc3ByaW5nQm9uZSk7XG5cbiAgICBvYmplY3RVcGRhdGVkLmFkZChzcHJpbmdCb25lLmJvbmUpO1xuXG4gICAgc3ByaW5nQm9uZXNEb25lLmFkZChzcHJpbmdCb25lKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gYSBzZXQgb2Ygb2JqZWN0cyB0aGF0IGFyZSBkZXBlbmRhbnQgb2YgZ2l2ZW4gc3ByaW5nIGJvbmUuXG4gICAqIEBwYXJhbSBzcHJpbmdCb25lIEEgc3ByaW5nIGJvbmVcbiAgICogQHJldHVybiBBIHNldCBvZiBvYmplY3RzIHRoYXQgYXJlIGRlcGVuZGFudCBvZiBnaXZlbiBzcHJpbmcgYm9uZVxuICAgKi9cbiAgcHJpdmF0ZSBfZ2V0RGVwZW5kZW5jaWVzKHNwcmluZ0JvbmU6IFZSTVNwcmluZ0JvbmVKb2ludCk6IFNldDxUSFJFRS5PYmplY3QzRD4ge1xuICAgIGNvbnN0IHNldCA9IG5ldyBTZXQ8VEhSRUUuT2JqZWN0M0Q+KCk7XG5cbiAgICBjb25zdCBwYXJlbnQgPSBzcHJpbmdCb25lLmJvbmUucGFyZW50O1xuICAgIGlmIChwYXJlbnQpIHtcbiAgICAgIHNldC5hZGQocGFyZW50KTtcbiAgICB9XG5cbiAgICBzcHJpbmdCb25lLmNvbGxpZGVyR3JvdXBzLmZvckVhY2goKGNvbGxpZGVyR3JvdXApID0+IHtcbiAgICAgIGNvbGxpZGVyR3JvdXAuY29sbGlkZXJzLmZvckVhY2goKGNvbGxpZGVyKSA9PiB7XG4gICAgICAgIHNldC5hZGQoY29sbGlkZXIpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gc2V0O1xuICB9XG59XG4iLCJpbXBvcnQgdHlwZSAqIGFzIFYwVlJNIGZyb20gJ0BwaXhpdi90eXBlcy12cm0tMC4wJztcbmltcG9ydCB0eXBlICogYXMgVjFTcHJpbmdCb25lU2NoZW1hIGZyb20gJ0BwaXhpdi90eXBlcy12cm1jLXNwcmluZ2JvbmUtMS4wJztcbmltcG9ydCAqIGFzIFRIUkVFIGZyb20gJ3RocmVlJztcbmltcG9ydCB0eXBlIHsgR0xURiwgR0xURkxvYWRlclBsdWdpbiwgR0xURlBhcnNlciB9IGZyb20gJ3RocmVlL2V4YW1wbGVzL2pzbS9sb2FkZXJzL0dMVEZMb2FkZXIuanMnO1xuaW1wb3J0IHsgVlJNU3ByaW5nQm9uZUNvbGxpZGVySGVscGVyLCBWUk1TcHJpbmdCb25lSm9pbnRIZWxwZXIgfSBmcm9tICcuL2hlbHBlcnMnO1xuaW1wb3J0IHsgVlJNU3ByaW5nQm9uZUNvbGxpZGVyIH0gZnJvbSAnLi9WUk1TcHJpbmdCb25lQ29sbGlkZXInO1xuaW1wb3J0IHR5cGUgeyBWUk1TcHJpbmdCb25lQ29sbGlkZXJHcm91cCB9IGZyb20gJy4vVlJNU3ByaW5nQm9uZUNvbGxpZGVyR3JvdXAnO1xuaW1wb3J0IHsgVlJNU3ByaW5nQm9uZUNvbGxpZGVyU2hhcGVDYXBzdWxlIH0gZnJvbSAnLi9WUk1TcHJpbmdCb25lQ29sbGlkZXJTaGFwZUNhcHN1bGUnO1xuaW1wb3J0IHsgVlJNU3ByaW5nQm9uZUNvbGxpZGVyU2hhcGVTcGhlcmUgfSBmcm9tICcuL1ZSTVNwcmluZ0JvbmVDb2xsaWRlclNoYXBlU3BoZXJlJztcbmltcG9ydCB7IFZSTVNwcmluZ0JvbmVKb2ludCB9IGZyb20gJy4vVlJNU3ByaW5nQm9uZUpvaW50JztcbmltcG9ydCB0eXBlIHsgVlJNU3ByaW5nQm9uZUxvYWRlclBsdWdpbk9wdGlvbnMgfSBmcm9tICcuL1ZSTVNwcmluZ0JvbmVMb2FkZXJQbHVnaW5PcHRpb25zJztcbmltcG9ydCB7IFZSTVNwcmluZ0JvbmVNYW5hZ2VyIH0gZnJvbSAnLi9WUk1TcHJpbmdCb25lTWFuYWdlcic7XG5pbXBvcnQgdHlwZSB7IFZSTVNwcmluZ0JvbmVKb2ludFNldHRpbmdzIH0gZnJvbSAnLi9WUk1TcHJpbmdCb25lSm9pbnRTZXR0aW5ncyc7XG5pbXBvcnQgeyBHTFRGIGFzIEdMVEZTY2hlbWEgfSBmcm9tICdAZ2x0Zi10cmFuc2Zvcm0vY29yZSc7XG5cbi8qKlxuICogUG9zc2libGUgc3BlYyB2ZXJzaW9ucyBpdCByZWNvZ25pemVzLlxuICovXG5jb25zdCBQT1NTSUJMRV9TUEVDX1ZFUlNJT05TID0gbmV3IFNldChbJzEuMCcsICcxLjAtYmV0YSddKTtcblxuZXhwb3J0IGNsYXNzIFZSTVNwcmluZ0JvbmVMb2FkZXJQbHVnaW4gaW1wbGVtZW50cyBHTFRGTG9hZGVyUGx1Z2luIHtcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBFWFRFTlNJT05fTkFNRSA9ICdWUk1DX3NwcmluZ0JvbmUnO1xuXG4gIC8qKlxuICAgKiBTcGVjaWZ5IGFuIE9iamVjdDNEIHRvIGFkZCB7QGxpbmsgVlJNU3ByaW5nQm9uZUpvaW50SGVscGVyfSBzLlxuICAgKiBJZiBub3Qgc3BlY2lmaWVkLCBoZWxwZXIgd2lsbCBub3QgYmUgY3JlYXRlZC5cbiAgICogSWYgYHJlbmRlck9yZGVyYCBpcyBzZXQgdG8gdGhlIHJvb3QsIGhlbHBlcnMgd2lsbCBjb3B5IHRoZSBzYW1lIGByZW5kZXJPcmRlcmAgLlxuICAgKi9cbiAgcHVibGljIGpvaW50SGVscGVyUm9vdD86IFRIUkVFLk9iamVjdDNEO1xuXG4gIC8qKlxuICAgKiBTcGVjaWZ5IGFuIE9iamVjdDNEIHRvIGFkZCB7QGxpbmsgVlJNU3ByaW5nQm9uZUpvaW50SGVscGVyfSBzLlxuICAgKiBJZiBub3Qgc3BlY2lmaWVkLCBoZWxwZXIgd2lsbCBub3QgYmUgY3JlYXRlZC5cbiAgICogSWYgYHJlbmRlck9yZGVyYCBpcyBzZXQgdG8gdGhlIHJvb3QsIGhlbHBlcnMgd2lsbCBjb3B5IHRoZSBzYW1lIGByZW5kZXJPcmRlcmAgLlxuICAgKi9cbiAgcHVibGljIGNvbGxpZGVySGVscGVyUm9vdD86IFRIUkVFLk9iamVjdDNEO1xuXG4gIHB1YmxpYyByZWFkb25seSBwYXJzZXI6IEdMVEZQYXJzZXI7XG5cbiAgcHVibGljIGdldCBuYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIFZSTVNwcmluZ0JvbmVMb2FkZXJQbHVnaW4uRVhURU5TSU9OX05BTUU7XG4gIH1cblxuICBwdWJsaWMgY29uc3RydWN0b3IocGFyc2VyOiBHTFRGUGFyc2VyLCBvcHRpb25zPzogVlJNU3ByaW5nQm9uZUxvYWRlclBsdWdpbk9wdGlvbnMpIHtcbiAgICB0aGlzLnBhcnNlciA9IHBhcnNlcjtcblxuICAgIHRoaXMuam9pbnRIZWxwZXJSb290ID0gb3B0aW9ucz8uam9pbnRIZWxwZXJSb290O1xuICAgIHRoaXMuY29sbGlkZXJIZWxwZXJSb290ID0gb3B0aW9ucz8uY29sbGlkZXJIZWxwZXJSb290O1xuICB9XG5cbiAgcHVibGljIGFzeW5jIGFmdGVyUm9vdChnbHRmOiBHTFRGKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgZ2x0Zi51c2VyRGF0YS52cm1TcHJpbmdCb25lTWFuYWdlciA9IGF3YWl0IHRoaXMuX2ltcG9ydChnbHRmKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbXBvcnQgc3ByaW5nIGJvbmVzIGZyb20gYSBHTFRGIGFuZCByZXR1cm4gYSB7QGxpbmsgVlJNU3ByaW5nQm9uZU1hbmFnZXJ9LlxuICAgKiBJdCBtaWdodCByZXR1cm4gYG51bGxgIGluc3RlYWQgd2hlbiBpdCBkb2VzIG5vdCBuZWVkIHRvIGJlIGNyZWF0ZWQgb3Igc29tZXRoaW5nIGdvIHdyb25nLlxuICAgKlxuICAgKiBAcGFyYW0gZ2x0ZiBBIHBhcnNlZCByZXN1bHQgb2YgR0xURiB0YWtlbiBmcm9tIEdMVEZMb2FkZXJcbiAgICovXG4gIHByaXZhdGUgYXN5bmMgX2ltcG9ydChnbHRmOiBHTFRGKTogUHJvbWlzZTxWUk1TcHJpbmdCb25lTWFuYWdlciB8IG51bGw+IHtcbiAgICBjb25zdCB2MVJlc3VsdCA9IGF3YWl0IHRoaXMuX3YxSW1wb3J0KGdsdGYpO1xuICAgIGlmICh2MVJlc3VsdCAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gdjFSZXN1bHQ7XG4gICAgfVxuXG4gICAgY29uc3QgdjBSZXN1bHQgPSBhd2FpdCB0aGlzLl92MEltcG9ydChnbHRmKTtcbiAgICBpZiAodjBSZXN1bHQgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHYwUmVzdWx0O1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBfdjFJbXBvcnQoZ2x0ZjogR0xURik6IFByb21pc2U8VlJNU3ByaW5nQm9uZU1hbmFnZXIgfCBudWxsPiB7XG4gICAgY29uc3QganNvbiA9IGdsdGYucGFyc2VyLmpzb24gYXMgR0xURlNjaGVtYS5JR0xURjtcblxuICAgIC8vIGVhcmx5IGFib3J0IGlmIGl0IGRvZXNuJ3QgdXNlIHNwcmluZyBib25lc1xuICAgIGNvbnN0IGlzU3ByaW5nQm9uZVVzZWQgPSBqc29uLmV4dGVuc2lvbnNVc2VkPy5pbmRleE9mKFZSTVNwcmluZ0JvbmVMb2FkZXJQbHVnaW4uRVhURU5TSU9OX05BTUUpICE9PSAtMTtcbiAgICBpZiAoIWlzU3ByaW5nQm9uZVVzZWQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IG1hbmFnZXIgPSBuZXcgVlJNU3ByaW5nQm9uZU1hbmFnZXIoKTtcblxuICAgIGNvbnN0IHRocmVlTm9kZXM6IFRIUkVFLk9iamVjdDNEW10gPSBhd2FpdCBnbHRmLnBhcnNlci5nZXREZXBlbmRlbmNpZXMoJ25vZGUnKTtcblxuICAgIGNvbnN0IGV4dGVuc2lvbiA9IGpzb24uZXh0ZW5zaW9ucz8uW1ZSTVNwcmluZ0JvbmVMb2FkZXJQbHVnaW4uRVhURU5TSU9OX05BTUVdIGFzXG4gICAgICB8IFYxU3ByaW5nQm9uZVNjaGVtYS5WUk1DU3ByaW5nQm9uZVxuICAgICAgfCB1bmRlZmluZWQ7XG4gICAgaWYgKCFleHRlbnNpb24pIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IHNwZWNWZXJzaW9uID0gZXh0ZW5zaW9uLnNwZWNWZXJzaW9uO1xuICAgIGlmICghUE9TU0lCTEVfU1BFQ19WRVJTSU9OUy5oYXMoc3BlY1ZlcnNpb24pKSB7XG4gICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgIGBWUk1TcHJpbmdCb25lTG9hZGVyUGx1Z2luOiBVbmtub3duICR7VlJNU3ByaW5nQm9uZUxvYWRlclBsdWdpbi5FWFRFTlNJT05fTkFNRX0gc3BlY1ZlcnNpb24gXCIke3NwZWNWZXJzaW9ufVwiYCxcbiAgICAgICk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBjb2xsaWRlcnMgPSBleHRlbnNpb24uY29sbGlkZXJzPy5tYXAoKHNjaGVtYUNvbGxpZGVyLCBpQ29sbGlkZXIpID0+IHtcbiAgICAgIGNvbnN0IG5vZGUgPSB0aHJlZU5vZGVzW3NjaGVtYUNvbGxpZGVyLm5vZGUhXTtcbiAgICAgIGNvbnN0IHNjaGVtYVNoYXBlID0gc2NoZW1hQ29sbGlkZXIuc2hhcGUhO1xuXG4gICAgICBpZiAoc2NoZW1hU2hhcGUuc3BoZXJlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pbXBvcnRTcGhlcmVDb2xsaWRlcihub2RlLCB7XG4gICAgICAgICAgb2Zmc2V0OiBuZXcgVEhSRUUuVmVjdG9yMygpLmZyb21BcnJheShzY2hlbWFTaGFwZS5zcGhlcmUub2Zmc2V0ID8/IFswLjAsIDAuMCwgMC4wXSksXG4gICAgICAgICAgcmFkaXVzOiBzY2hlbWFTaGFwZS5zcGhlcmUucmFkaXVzID8/IDAuMCxcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2UgaWYgKHNjaGVtYVNoYXBlLmNhcHN1bGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ltcG9ydENhcHN1bGVDb2xsaWRlcihub2RlLCB7XG4gICAgICAgICAgb2Zmc2V0OiBuZXcgVEhSRUUuVmVjdG9yMygpLmZyb21BcnJheShzY2hlbWFTaGFwZS5jYXBzdWxlLm9mZnNldCA/PyBbMC4wLCAwLjAsIDAuMF0pLFxuICAgICAgICAgIHJhZGl1czogc2NoZW1hU2hhcGUuY2Fwc3VsZS5yYWRpdXMgPz8gMC4wLFxuICAgICAgICAgIHRhaWw6IG5ldyBUSFJFRS5WZWN0b3IzKCkuZnJvbUFycmF5KHNjaGVtYVNoYXBlLmNhcHN1bGUudGFpbCA/PyBbMC4wLCAwLjAsIDAuMF0pLFxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBWUk1TcHJpbmdCb25lTG9hZGVyUGx1Z2luOiBUaGUgY29sbGlkZXIgIyR7aUNvbGxpZGVyfSBoYXMgbm8gdmFsaWQgc2hhcGVgKTtcbiAgICB9KTtcblxuICAgIGNvbnN0IGNvbGxpZGVyR3JvdXBzID0gZXh0ZW5zaW9uLmNvbGxpZGVyR3JvdXBzPy5tYXAoXG4gICAgICAoc2NoZW1hQ29sbGlkZXJHcm91cCwgaUNvbGxpZGVyR3JvdXApOiBWUk1TcHJpbmdCb25lQ29sbGlkZXJHcm91cCA9PiB7XG4gICAgICAgIGNvbnN0IGNvbHMgPSAoc2NoZW1hQ29sbGlkZXJHcm91cC5jb2xsaWRlcnMgPz8gW10pLm1hcCgoaUNvbGxpZGVyKSA9PiB7XG4gICAgICAgICAgY29uc3QgY29sID0gY29sbGlkZXJzPy5baUNvbGxpZGVyXTtcblxuICAgICAgICAgIGlmIChjb2wgPT0gbnVsbCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICBgVlJNU3ByaW5nQm9uZUxvYWRlclBsdWdpbjogVGhlIGNvbGxpZGVyR3JvdXAgIyR7aUNvbGxpZGVyR3JvdXB9IGF0dGVtcHRlZCB0byB1c2UgYSBjb2xsaWRlciAjJHtpQ29sbGlkZXJ9IGJ1dCBub3QgZm91bmRgLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gY29sO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGNvbGxpZGVyczogY29scyxcbiAgICAgICAgICBuYW1lOiBzY2hlbWFDb2xsaWRlckdyb3VwLm5hbWUsXG4gICAgICAgIH07XG4gICAgICB9LFxuICAgICk7XG5cbiAgICBleHRlbnNpb24uc3ByaW5ncz8uZm9yRWFjaCgoc2NoZW1hU3ByaW5nLCBpU3ByaW5nKSA9PiB7XG4gICAgICBjb25zdCBzY2hlbWFKb2ludHMgPSBzY2hlbWFTcHJpbmcuam9pbnRzO1xuXG4gICAgICAvLyBwcmVwYXJlIGNvbGxpZGVyc1xuICAgICAgY29uc3QgY29sbGlkZXJHcm91cHNGb3JTcHJpbmcgPSBzY2hlbWFTcHJpbmcuY29sbGlkZXJHcm91cHM/Lm1hcCgoaUNvbGxpZGVyR3JvdXApID0+IHtcbiAgICAgICAgY29uc3QgZ3JvdXAgPSBjb2xsaWRlckdyb3Vwcz8uW2lDb2xsaWRlckdyb3VwXTtcblxuICAgICAgICBpZiAoZ3JvdXAgPT0gbnVsbCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBWUk1TcHJpbmdCb25lTG9hZGVyUGx1Z2luOiBUaGUgc3ByaW5nICMke2lTcHJpbmd9IGF0dGVtcHRlZCB0byB1c2UgYSBjb2xsaWRlckdyb3VwICR7aUNvbGxpZGVyR3JvdXB9IGJ1dCBub3QgZm91bmRgLFxuICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZ3JvdXA7XG4gICAgICB9KTtcblxuICAgICAgY29uc3QgY2VudGVyID0gc2NoZW1hU3ByaW5nLmNlbnRlciAhPSBudWxsID8gdGhyZWVOb2Rlc1tzY2hlbWFTcHJpbmcuY2VudGVyXSA6IHVuZGVmaW5lZDtcblxuICAgICAgbGV0IHByZXZTY2hlbWFKb2ludDogVjFTcHJpbmdCb25lU2NoZW1hLlNwcmluZ0JvbmVKb2ludCB8IHVuZGVmaW5lZDtcbiAgICAgIHNjaGVtYUpvaW50cy5mb3JFYWNoKChzY2hlbWFKb2ludCkgPT4ge1xuICAgICAgICBpZiAocHJldlNjaGVtYUpvaW50KSB7XG4gICAgICAgICAgLy8gcHJlcGFyZSBub2RlXG4gICAgICAgICAgY29uc3Qgbm9kZUluZGV4ID0gcHJldlNjaGVtYUpvaW50Lm5vZGU7XG4gICAgICAgICAgY29uc3Qgbm9kZSA9IHRocmVlTm9kZXNbbm9kZUluZGV4XTtcbiAgICAgICAgICBjb25zdCBjaGlsZEluZGV4ID0gc2NoZW1hSm9pbnQubm9kZTtcbiAgICAgICAgICBjb25zdCBjaGlsZCA9IHRocmVlTm9kZXNbY2hpbGRJbmRleF07XG5cbiAgICAgICAgICAvLyBwcmVwYXJlIHNldHRpbmdcbiAgICAgICAgICBjb25zdCBzZXR0aW5nOiBQYXJ0aWFsPFZSTVNwcmluZ0JvbmVKb2ludFNldHRpbmdzPiA9IHtcbiAgICAgICAgICAgIGhpdFJhZGl1czogcHJldlNjaGVtYUpvaW50LmhpdFJhZGl1cyxcbiAgICAgICAgICAgIGRyYWdGb3JjZTogcHJldlNjaGVtYUpvaW50LmRyYWdGb3JjZSxcbiAgICAgICAgICAgIGdyYXZpdHlQb3dlcjogcHJldlNjaGVtYUpvaW50LmdyYXZpdHlQb3dlcixcbiAgICAgICAgICAgIHN0aWZmbmVzczogcHJldlNjaGVtYUpvaW50LnN0aWZmbmVzcyxcbiAgICAgICAgICAgIGdyYXZpdHlEaXI6XG4gICAgICAgICAgICAgIHByZXZTY2hlbWFKb2ludC5ncmF2aXR5RGlyICE9IG51bGxcbiAgICAgICAgICAgICAgICA/IG5ldyBUSFJFRS5WZWN0b3IzKCkuZnJvbUFycmF5KHByZXZTY2hlbWFKb2ludC5ncmF2aXR5RGlyKVxuICAgICAgICAgICAgICAgIDogdW5kZWZpbmVkLFxuICAgICAgICAgIH07XG5cbiAgICAgICAgICAvLyBjcmVhdGUgc3ByaW5nIGJvbmVzXG4gICAgICAgICAgY29uc3Qgam9pbnQgPSB0aGlzLl9pbXBvcnRKb2ludChub2RlLCBjaGlsZCwgc2V0dGluZywgY29sbGlkZXJHcm91cHNGb3JTcHJpbmcpO1xuICAgICAgICAgIGlmIChjZW50ZXIpIHtcbiAgICAgICAgICAgIGpvaW50LmNlbnRlciA9IGNlbnRlcjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBtYW5hZ2VyLmFkZEpvaW50KGpvaW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByZXZTY2hlbWFKb2ludCA9IHNjaGVtYUpvaW50O1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAvLyBpbml0IHNwcmluZyBib25lc1xuICAgIG1hbmFnZXIuc2V0SW5pdFN0YXRlKCk7XG5cbiAgICByZXR1cm4gbWFuYWdlcjtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgX3YwSW1wb3J0KGdsdGY6IEdMVEYpOiBQcm9taXNlPFZSTVNwcmluZ0JvbmVNYW5hZ2VyIHwgbnVsbD4ge1xuICAgIGNvbnN0IGpzb24gPSBnbHRmLnBhcnNlci5qc29uIGFzIEdMVEZTY2hlbWEuSUdMVEY7XG5cbiAgICAvLyBlYXJseSBhYm9ydCBpZiBpdCBkb2Vzbid0IHVzZSB2cm1cbiAgICBjb25zdCBpc1ZSTVVzZWQgPSBqc29uLmV4dGVuc2lvbnNVc2VkPy5pbmRleE9mKCdWUk0nKSAhPT0gLTE7XG4gICAgaWYgKCFpc1ZSTVVzZWQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIGVhcmx5IGFib3J0IGlmIGl0IGRvZXNuJ3QgaGF2ZSBib25lIGdyb3Vwc1xuICAgIGNvbnN0IGV4dGVuc2lvbiA9IGpzb24uZXh0ZW5zaW9ucz8uWydWUk0nXSBhcyBWMFZSTS5WUk0gfCB1bmRlZmluZWQ7XG4gICAgY29uc3Qgc2NoZW1hU2Vjb25kYXJ5QW5pbWF0aW9uID0gZXh0ZW5zaW9uPy5zZWNvbmRhcnlBbmltYXRpb247XG4gICAgaWYgKCFzY2hlbWFTZWNvbmRhcnlBbmltYXRpb24pIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IHNjaGVtYUJvbmVHcm91cHMgPSBzY2hlbWFTZWNvbmRhcnlBbmltYXRpb24/LmJvbmVHcm91cHM7XG4gICAgaWYgKCFzY2hlbWFCb25lR3JvdXBzKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBtYW5hZ2VyID0gbmV3IFZSTVNwcmluZ0JvbmVNYW5hZ2VyKCk7XG5cbiAgICBjb25zdCB0aHJlZU5vZGVzOiBUSFJFRS5PYmplY3QzRFtdID0gYXdhaXQgZ2x0Zi5wYXJzZXIuZ2V0RGVwZW5kZW5jaWVzKCdub2RlJyk7XG5cbiAgICBjb25zdCBjb2xsaWRlckdyb3VwcyA9IHNjaGVtYVNlY29uZGFyeUFuaW1hdGlvbi5jb2xsaWRlckdyb3Vwcz8ubWFwKFxuICAgICAgKHNjaGVtYUNvbGxpZGVyR3JvdXApOiBWUk1TcHJpbmdCb25lQ29sbGlkZXJHcm91cCA9PiB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSB0aHJlZU5vZGVzW3NjaGVtYUNvbGxpZGVyR3JvdXAubm9kZSFdO1xuICAgICAgICBjb25zdCBjb2xsaWRlcnMgPSAoc2NoZW1hQ29sbGlkZXJHcm91cC5jb2xsaWRlcnMgPz8gW10pLm1hcCgoc2NoZW1hQ29sbGlkZXIsIGlDb2xsaWRlcikgPT4ge1xuICAgICAgICAgIGNvbnN0IG9mZnNldCA9IG5ldyBUSFJFRS5WZWN0b3IzKDAuMCwgMC4wLCAwLjApO1xuICAgICAgICAgIGlmIChzY2hlbWFDb2xsaWRlci5vZmZzZXQpIHtcbiAgICAgICAgICAgIG9mZnNldC5zZXQoXG4gICAgICAgICAgICAgIHNjaGVtYUNvbGxpZGVyLm9mZnNldC54ID8/IDAuMCxcbiAgICAgICAgICAgICAgc2NoZW1hQ29sbGlkZXIub2Zmc2V0LnkgPz8gMC4wLFxuICAgICAgICAgICAgICBzY2hlbWFDb2xsaWRlci5vZmZzZXQueiA/IC1zY2hlbWFDb2xsaWRlci5vZmZzZXQueiA6IDAuMCwgLy8geiBpcyBvcHBvc2l0ZSBpbiBWUk0wLjBcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIHRoaXMuX2ltcG9ydFNwaGVyZUNvbGxpZGVyKG5vZGUsIHtcbiAgICAgICAgICAgIG9mZnNldCxcbiAgICAgICAgICAgIHJhZGl1czogc2NoZW1hQ29sbGlkZXIucmFkaXVzID8/IDAuMCxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHsgY29sbGlkZXJzIH07XG4gICAgICB9LFxuICAgICk7XG5cbiAgICAvLyBpbXBvcnQgc3ByaW5nIGJvbmVzIGZvciBlYWNoIHNwcmluZyBib25lIGdyb3Vwc1xuICAgIHNjaGVtYUJvbmVHcm91cHM/LmZvckVhY2goKHNjaGVtYUJvbmVHcm91cCwgaUJvbmVHcm91cCkgPT4ge1xuICAgICAgY29uc3Qgcm9vdEluZGljZXMgPSBzY2hlbWFCb25lR3JvdXAuYm9uZXM7XG4gICAgICBpZiAoIXJvb3RJbmRpY2VzKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgcm9vdEluZGljZXMuZm9yRWFjaCgocm9vdEluZGV4KSA9PiB7XG4gICAgICAgIGNvbnN0IHJvb3QgPSB0aHJlZU5vZGVzW3Jvb3RJbmRleF07XG5cbiAgICAgICAgLy8gcHJlcGFyZSBzZXR0aW5nXG4gICAgICAgIGNvbnN0IGdyYXZpdHlEaXIgPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xuICAgICAgICBpZiAoc2NoZW1hQm9uZUdyb3VwLmdyYXZpdHlEaXIpIHtcbiAgICAgICAgICBncmF2aXR5RGlyLnNldChcbiAgICAgICAgICAgIHNjaGVtYUJvbmVHcm91cC5ncmF2aXR5RGlyLnggPz8gMC4wLFxuICAgICAgICAgICAgc2NoZW1hQm9uZUdyb3VwLmdyYXZpdHlEaXIueSA/PyAwLjAsXG4gICAgICAgICAgICBzY2hlbWFCb25lR3JvdXAuZ3Jhdml0eURpci56ID8/IDAuMCxcbiAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGdyYXZpdHlEaXIuc2V0KDAuMCwgLTEuMCwgMC4wKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNlbnRlciA9IHNjaGVtYUJvbmVHcm91cC5jZW50ZXIgIT0gbnVsbCA/IHRocmVlTm9kZXNbc2NoZW1hQm9uZUdyb3VwLmNlbnRlcl0gOiB1bmRlZmluZWQ7XG5cbiAgICAgICAgY29uc3Qgc2V0dGluZzogUGFydGlhbDxWUk1TcHJpbmdCb25lSm9pbnRTZXR0aW5ncz4gPSB7XG4gICAgICAgICAgaGl0UmFkaXVzOiBzY2hlbWFCb25lR3JvdXAuaGl0UmFkaXVzLFxuICAgICAgICAgIGRyYWdGb3JjZTogc2NoZW1hQm9uZUdyb3VwLmRyYWdGb3JjZSxcbiAgICAgICAgICBncmF2aXR5UG93ZXI6IHNjaGVtYUJvbmVHcm91cC5ncmF2aXR5UG93ZXIsXG4gICAgICAgICAgc3RpZmZuZXNzOiBzY2hlbWFCb25lR3JvdXAuc3RpZmZpbmVzcyxcbiAgICAgICAgICBncmF2aXR5RGlyLFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIHByZXBhcmUgY29sbGlkZXJzXG4gICAgICAgIGNvbnN0IGNvbGxpZGVyR3JvdXBzRm9yU3ByaW5nID0gc2NoZW1hQm9uZUdyb3VwLmNvbGxpZGVyR3JvdXBzPy5tYXAoKGlDb2xsaWRlckdyb3VwKSA9PiB7XG4gICAgICAgICAgY29uc3QgZ3JvdXAgPSBjb2xsaWRlckdyb3Vwcz8uW2lDb2xsaWRlckdyb3VwXTtcblxuICAgICAgICAgIGlmIChncm91cCA9PSBudWxsKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgIGBWUk1TcHJpbmdCb25lTG9hZGVyUGx1Z2luOiBUaGUgc3ByaW5nICMke2lCb25lR3JvdXB9IGF0dGVtcHRlZCB0byB1c2UgYSBjb2xsaWRlckdyb3VwICR7aUNvbGxpZGVyR3JvdXB9IGJ1dCBub3QgZm91bmRgLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gZ3JvdXA7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIGNyZWF0ZSBzcHJpbmcgYm9uZXNcbiAgICAgICAgcm9vdC50cmF2ZXJzZSgobm9kZSkgPT4ge1xuICAgICAgICAgIGNvbnN0IGNoaWxkOiBUSFJFRS5PYmplY3QzRCB8IG51bGwgPSBub2RlLmNoaWxkcmVuWzBdID8/IG51bGw7XG5cbiAgICAgICAgICBjb25zdCBqb2ludCA9IHRoaXMuX2ltcG9ydEpvaW50KG5vZGUsIGNoaWxkLCBzZXR0aW5nLCBjb2xsaWRlckdyb3Vwc0ZvclNwcmluZyk7XG4gICAgICAgICAgaWYgKGNlbnRlcikge1xuICAgICAgICAgICAgam9pbnQuY2VudGVyID0gY2VudGVyO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIG1hbmFnZXIuYWRkSm9pbnQoam9pbnQpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgLy8gaW5pdCBzcHJpbmcgYm9uZXNcbiAgICBnbHRmLnNjZW5lLnVwZGF0ZU1hdHJpeFdvcmxkKCk7XG4gICAgbWFuYWdlci5zZXRJbml0U3RhdGUoKTtcblxuICAgIHJldHVybiBtYW5hZ2VyO1xuICB9XG5cbiAgcHJpdmF0ZSBfaW1wb3J0Sm9pbnQoXG4gICAgbm9kZTogVEhSRUUuT2JqZWN0M0QsXG4gICAgY2hpbGQ6IFRIUkVFLk9iamVjdDNELFxuICAgIHNldHRpbmc/OiBQYXJ0aWFsPFZSTVNwcmluZ0JvbmVKb2ludFNldHRpbmdzPixcbiAgICBjb2xsaWRlckdyb3Vwc0ZvclNwcmluZz86IFZSTVNwcmluZ0JvbmVDb2xsaWRlckdyb3VwW10sXG4gICk6IFZSTVNwcmluZ0JvbmVKb2ludCB7XG4gICAgY29uc3Qgc3ByaW5nQm9uZSA9IG5ldyBWUk1TcHJpbmdCb25lSm9pbnQobm9kZSwgY2hpbGQsIHNldHRpbmcsIGNvbGxpZGVyR3JvdXBzRm9yU3ByaW5nKTtcblxuICAgIGlmICh0aGlzLmpvaW50SGVscGVyUm9vdCkge1xuICAgICAgY29uc3QgaGVscGVyID0gbmV3IFZSTVNwcmluZ0JvbmVKb2ludEhlbHBlcihzcHJpbmdCb25lKTtcbiAgICAgIHRoaXMuam9pbnRIZWxwZXJSb290LmFkZChoZWxwZXIpO1xuICAgICAgaGVscGVyLnJlbmRlck9yZGVyID0gdGhpcy5qb2ludEhlbHBlclJvb3QucmVuZGVyT3JkZXI7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNwcmluZ0JvbmU7XG4gIH1cblxuICBwcml2YXRlIF9pbXBvcnRTcGhlcmVDb2xsaWRlcihcbiAgICBkZXN0aW5hdGlvbjogVEhSRUUuT2JqZWN0M0QsXG4gICAgcGFyYW1zOiB7XG4gICAgICBvZmZzZXQ6IFRIUkVFLlZlY3RvcjM7XG4gICAgICByYWRpdXM6IG51bWJlcjtcbiAgICB9LFxuICApOiBWUk1TcHJpbmdCb25lQ29sbGlkZXIge1xuICAgIGNvbnN0IHsgb2Zmc2V0LCByYWRpdXMgfSA9IHBhcmFtcztcblxuICAgIGNvbnN0IHNoYXBlID0gbmV3IFZSTVNwcmluZ0JvbmVDb2xsaWRlclNoYXBlU3BoZXJlKHsgb2Zmc2V0LCByYWRpdXMgfSk7XG5cbiAgICBjb25zdCBjb2xsaWRlciA9IG5ldyBWUk1TcHJpbmdCb25lQ29sbGlkZXIoc2hhcGUpO1xuXG4gICAgZGVzdGluYXRpb24uYWRkKGNvbGxpZGVyKTtcblxuICAgIGlmICh0aGlzLmNvbGxpZGVySGVscGVyUm9vdCkge1xuICAgICAgY29uc3QgaGVscGVyID0gbmV3IFZSTVNwcmluZ0JvbmVDb2xsaWRlckhlbHBlcihjb2xsaWRlcik7XG4gICAgICB0aGlzLmNvbGxpZGVySGVscGVyUm9vdC5hZGQoaGVscGVyKTtcbiAgICAgIGhlbHBlci5yZW5kZXJPcmRlciA9IHRoaXMuY29sbGlkZXJIZWxwZXJSb290LnJlbmRlck9yZGVyO1xuICAgIH1cblxuICAgIHJldHVybiBjb2xsaWRlcjtcbiAgfVxuXG4gIHByaXZhdGUgX2ltcG9ydENhcHN1bGVDb2xsaWRlcihcbiAgICBkZXN0aW5hdGlvbjogVEhSRUUuT2JqZWN0M0QsXG4gICAgcGFyYW1zOiB7XG4gICAgICBvZmZzZXQ6IFRIUkVFLlZlY3RvcjM7XG4gICAgICByYWRpdXM6IG51bWJlcjtcbiAgICAgIHRhaWw6IFRIUkVFLlZlY3RvcjM7XG4gICAgfSxcbiAgKTogVlJNU3ByaW5nQm9uZUNvbGxpZGVyIHtcbiAgICBjb25zdCB7IG9mZnNldCwgcmFkaXVzLCB0YWlsIH0gPSBwYXJhbXM7XG5cbiAgICBjb25zdCBzaGFwZSA9IG5ldyBWUk1TcHJpbmdCb25lQ29sbGlkZXJTaGFwZUNhcHN1bGUoeyBvZmZzZXQsIHJhZGl1cywgdGFpbCB9KTtcblxuICAgIGNvbnN0IGNvbGxpZGVyID0gbmV3IFZSTVNwcmluZ0JvbmVDb2xsaWRlcihzaGFwZSk7XG5cbiAgICBkZXN0aW5hdGlvbi5hZGQoY29sbGlkZXIpO1xuXG4gICAgaWYgKHRoaXMuY29sbGlkZXJIZWxwZXJSb290KSB7XG4gICAgICBjb25zdCBoZWxwZXIgPSBuZXcgVlJNU3ByaW5nQm9uZUNvbGxpZGVySGVscGVyKGNvbGxpZGVyKTtcbiAgICAgIHRoaXMuY29sbGlkZXJIZWxwZXJSb290LmFkZChoZWxwZXIpO1xuICAgICAgaGVscGVyLnJlbmRlck9yZGVyID0gdGhpcy5jb2xsaWRlckhlbHBlclJvb3QucmVuZGVyT3JkZXI7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbGxpZGVyO1xuICB9XG59XG4iXSwibmFtZXMiOlsiX3YzQSIsIlRIUkVFIiwiX3YzQiIsIl9tYXRBIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBQUE7O0lBRUc7VUFDbUIsMEJBQTBCLENBQUE7SUFzQi9DOztJQ3RCRCxNQUFNQSxNQUFJLEdBQUcsSUFBSUMsZ0JBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUNqQyxNQUFNQyxNQUFJLEdBQUcsSUFBSUQsZ0JBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUUzQixNQUFPLGlDQUFrQyxTQUFRLDBCQUEwQixDQUFBO0lBb0IvRSxJQUFBLFdBQUEsQ0FBbUIsTUFBMEUsRUFBQTs7SUFDM0YsUUFB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RyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDOUQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2pFLFNBQUE7WUFFRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUMzQixNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQztnQkFDL0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzVELElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzVELFNBQUE7SUFFRCxRQUFBLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3BGLFFBQUEsTUFBTSxHQUFHLEdB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QUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDdkQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzVELElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzdELFNBQUE7SUFFRCxRQUFBLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUMxRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFOUUsUUFBQSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNsQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUV4RixRQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztTQUNsQztRQUVPLFdBQVcsR0FBQTtZQUNqQixLQUFLLElBQUksQ0FBQyxH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
