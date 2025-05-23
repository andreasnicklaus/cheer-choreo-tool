const { Router } = require("express");
const ChoreoService = require("../services/ChoreoService");
const { authenticateUser } = require("../services/AuthService");

/**
 * @swagger
 * tags:
 * - name: Choreos
 */

/** @ignore */
const router = Router();

/**
 * @openapi
 * /choreo/{id}:
 *  get:
 *    description: Get a list of choreos or a specific choreo
 *    tags:
 *    - Choreos
 *    parameters:
 *    - name: id
 *      in: path
 *      required: false
 *      schema:
 *        type: string
 *        format: uuid
 *    responses:
 *      200:
 *        description: Either a list of choreos if id was not defined or a specific choreo otherwise
 *        content:
 *          application/json:
 *            schema:
 *              oneOf:
 *              - $ref: '#/components/schemas/Choreo'
 *              - type: array
 *                items:
 *                  $ref: '#/components/schemas/Choreo'
 *      404:
 *        description: Choreo was not found
 *        content:
 *          application/json:
 *            schema:
 *              type: string
 *              example: Not found
 */
router.get("/:id?", authenticateUser(), (req, res, next) => {
  if (req.params.id)
    ChoreoService.findById(req.params.id, req.UserId)
      .then((foundChoreo) => {
        if (!foundChoreo) res.status(404).send(req.t("responses.not-found"));
        else res.send(foundChoreo);
        return next();
      })
      .catch((e) => next(e));
  else {
    ChoreoService.getAll(req.UserId)
      .then((choreoList) => {
        res.send(choreoList);
        return next();
      })
      .catch((e) => next(e));
  }
});

/**
 * @openapi
 * /choreo/:
 *   post:
 *     description: Create a new choreo
 *     tags:
 *       - Choreos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - counts
 *               - matType
 *               - seasonTeamId
 *             properties:
 *               name:
 *                 type: string
 *               counts:
 *                 type: integer
 *               matType:
 *                 type: string
 *               seasonTeamId:
 *                 type: string
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Choreo created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Choreo'
 */
router.post("/", authenticateUser(), (req, res, next) => {
  const { name, counts, matType, seasonTeamId, participants } = req.body;
  return ChoreoService.create(
    name,
    counts,
    matType,
    seasonTeamId,
    participants,
    req.UserId
  )
    .then((choreo) => {
      res.send(choreo);
      return next();
    })
    .catch((e) => next(e));
});

/**
 * @openapi
 * /choreo/{id}:
 *   put:
 *     description: Update a choreo by ID
 *     tags:
 *       - Choreos
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Choreo'
 *     responses:
 *       200:
 *         description: Choreo updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Choreo'
 *       404:
 *         description: Choreo not found
 */
router.put("/:id", authenticateUser(), (req, res, next) => {
  return ChoreoService.update(req.params.id, req.body, req.UserId)
    .then((result) => {
      res.send(result);
      return next();
    })
    .catch((e) => next(e));
});

/**
 * @openapi
 * /choreo/{id}:
 *   delete:
 *     description: Delete a choreo by ID
 *     tags:
 *       - Choreos
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Choreo deleted successfully
 *       404:
 *         description: Choreo not found
 */
router.delete("/:id", authenticateUser(), (req, res, next) => {
  return ChoreoService.remove(req.params.id, req.UserId)
    .then((result) => {
      res.send(result);
      return next();
    })
    .catch((e) => next(e));
});

/**
 * @openapi
 * /choreo/{id}/participants:
 *   post:
 *     description: Add a participant to a choreo
 *     tags:
 *       - Choreos
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - memberId
 *             properties:
 *               memberId:
 *                 type: string
 *               color:
 *                 type: string
 *     responses:
 *       200:
 *         description: Participant added successfully
 */
router.post("/:id/participants", authenticateUser(), (req, res, next) => {
  const { memberId, color } = req.body;
  return ChoreoService.addParticipant(
    req.params.id,
    memberId,
    req.UserId,
    color
  )
    .then(() => {
      res.send();
      return next();
    })
    .catch((e) => next(e));
});

/**
 * @openapi
 * /choreo/{id}/participants/{participationId}:
 *   delete:
 *     description: Remove a participant from a choreo
 *     tags:
 *       - Choreos
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: participationId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Participant removed successfully
 */
router.delete(
  "/:id/participants/:participationId",
  authenticateUser(),
  (req, res, next) => {
    return ChoreoService.removeParticipant(
      req.params.id,
      req.params.participationId,
      req.UserId
    )
      .then(() => {
        res.send();
        return next();
      })
      .catch((e) => next(e));
  }
);

/**
 * @openapi
 * /choreo/{id}/participants:
 *   patch:
 *     description: Replace a participant in a choreo
 *     tags:
 *       - Choreos
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - memberToRemoveId
 *               - memberToAddId
 *             properties:
 *               memberToRemoveId:
 *                 type: string
 *               memberToAddId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Participant replaced successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Choreo'
 */
router.patch("/:id/participants", authenticateUser(), (req, res, next) => {
  const { memberToRemoveId, memberToAddId } = req.body;
  return ChoreoService.replaceParticipant(
    req.params.id,
    memberToAddId,
    memberToRemoveId,
    req.UserId
  )
    .then((choreo) => {
      res.send(choreo);
      return next();
    })
    .catch((e) => next(e));
});

/**
 * @openapi
 * /choreo/{id}/participants/{participantId}:
 *   patch:
 *     description: Change the color of a participant in a choreo
 *     tags:
 *       - Choreos
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: participantId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - color
 *             properties:
 *               color:
 *                 type: string
 *     responses:
 *       200:
 *         description: Color changed successfully
 */
router.patch(
  "/:id/participants/:participantId",
  authenticateUser(),
  (req, res, next) => {
    const { color } = req.body;
    return ChoreoService.changeParticipationColor(
      req.params.id,
      req.params.participantId,
      color,
      req.UserId
    )
      .then(() => {
        res.send();
        return next();
      })
      .catch((e) => next(e));
  }
);

module.exports = { choreoRouter: router };
