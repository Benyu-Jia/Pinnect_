import torch
import matplotlib.pyplot as plt
from torchvision import datasets, transforms
import numpy as np
import random

IMAGE_SIZE = 784
IMAGE_WIDTH = IMAGE_HEIGHT = 32

batch_size = 400

# Do we have GPUs available?
use_cuda = torch.cuda.is_available()

# Handy way to use GPUs if there are any
device = torch.device("cuda") if torch.cuda.is_available() else torch.device("cpu")

# Data loader parameters
kwargs = {'num_workers': 3, 'pin_memory': True} if use_cuda else {}

## Load data

#need permission for this dataset
#train_data = datasets.ImageNet('../../data/imagenet/', train=True, download=True , transform=transforms.ToTensor())

#go with cifar100 instead
train_data  = datasets.CIFAR10('./data.cifar10', train=True, download=True ,transform=transforms.Compose([
                transforms.ToTensor(),
                transforms.Normalize((0.4914, 0.4822, 0.4465), (0.2023, 0.1994, 0.2010))]))
test_data  = datasets.CIFAR10('./data.cifar10', train=False, download=True ,transform=transforms.Compose([
                transforms.ToTensor(),
                transforms.Normalize((0.4914, 0.4822, 0.4465), (0.2023, 0.1994, 0.2010))]))
# train_data = datasets.CIFAR100('../../data/CIFAR100/', train=True, download=False , transform=None)
# test_data  = datasets.CIFAR100('../../data/CIFAR100/', train=False, download=False, transform=None)
train_loader = torch.utils.data.DataLoader(train_data, shuffle=True, batch_size=batch_size, drop_last=True, **kwargs)
test_loader = torch.utils.data.DataLoader(test_data, shuffle=False, batch_size=batch_size*2, drop_last=True, **kwargs)

####labels
coarse_label = [
'apple', # id 0
'aquarium_fish',
'baby',
'bear',
'beaver',
'bed',
'bee',
'beetle',
'bicycle',
'bottle',
'bowl',
'boy',
'bridge',
'bus',
'butterfly',
'camel',
'can',
'castle',
'caterpillar',
'cattle',
'chair',
'chimpanzee',
'clock',
'cloud',
'cockroach',
'couch',
'crab',
'crocodile',
'cup',
'dinosaur',
'dolphin',
'elephant',
'flatfish',
'forest',
'fox',
'girl',
'hamster',
'house',
'kangaroo',
'computer_keyboard',
'lamp',
'lawn_mower',
'leopard',
'lion',
'lizard',
'lobster',
'man',
'maple_tree',
'motorcycle',
'mountain',
'mouse',
'mushroom',
'oak_tree',
'orange',
'orchid',
'otter',
'palm_tree',
'pear',
'pickup_truck',
'pine_tree',
'plain',
'plate',
'poppy',
'porcupine',
'possum',
'rabbit',
'raccoon',
'ray',
'road',
'rocket',
'rose',
'sea',
'seal',
'shark',
'shrew',
'skunk',
'skyscraper',
'snail',
'snake',
'spider',
'squirrel',
'streetcar',
'sunflower',
'sweet_pepper',
'table',
'tank',
'telephone',
'television',
'tiger',
'tractor',
'train',
'trout',
'tulip',
'turtle',
'wardrobe',
'whale',
'willow_tree',
'wolf',
'woman',
'worm',
]

mapping = {
'aquatic mammals': ['beaver', 'dolphin', 'otter', 'seal', 'whale'],
'fish': ['aquarium_fish', 'flatfish', 'ray', 'shark', 'trout'],
'flowers': ['orchid', 'poppy', 'rose', 'sunflower', 'tulip'],
'food containers': ['bottle', 'bowl', 'can', 'cup', 'plate'],
'fruit and vegetables': ['apple', 'mushroom', 'orange', 'pear', 'sweet_pepper'],
'household electrical device': ['clock', 'computer_keyboard', 'lamp', 'telephone', 'television'],
'household furniture': ['bed', 'chair', 'couch', 'table', 'wardrobe'],
'insects': ['bee', 'beetle', 'butterfly', 'caterpillar', 'cockroach'],
'large carnivores': ['bear', 'leopard', 'lion', 'tiger', 'wolf'],
'large man-made outdoor things': ['bridge', 'castle', 'house', 'road', 'skyscraper'],
'large natural outdoor scenes': ['cloud', 'forest', 'mountain', 'plain', 'sea'],
'large omnivores and herbivores': ['camel', 'cattle', 'chimpanzee', 'elephant', 'kangaroo'],
'medium-sized mammals': ['fox', 'porcupine', 'possum', 'raccoon', 'skunk'],
'non-insect invertebrates': ['crab', 'lobster', 'snail', 'spider', 'worm'],
'people': ['baby', 'boy', 'girl', 'man', 'woman'],
'reptiles': ['crocodile', 'dinosaur', 'lizard', 'snake', 'turtle'],
'small mammals': ['hamster', 'mouse', 'rabbit', 'shrew', 'squirrel'],
'trees': ['maple_tree', 'oak_tree', 'palm_tree', 'pine_tree', 'willow_tree'],
'vehicles 1': ['bicycle', 'bus', 'motorcycle', 'pickup_truck', 'train'],
'vehicles 2': ['lawn_mower', 'rocket', 'streetcar', 'tank', 'tractor'],
}

#show image
def show(img, title=None, cmap_='tab10'):
    ## converting to a CPU memory numpy array
    npimg = img.cpu().numpy()
    if title != None:
        print(title)
    plt.imshow(npimg, cmap=cmap_, vmin=0,  interpolation='nearest')
    plt.show()

# Look at random example from training data
train_image, train_label = (train_data[0])

# Let's see what the image looks like
print(train_image.shape)
print(train_image)
print(coarse_label[train_label])
plt.imshow(train_image[0])
plt.show()

#plt.imshow(np.transpose(np.asarray(train_image[0].squeeze()),(0,1)))

##first try
##print(plt.imshow( train_image[0].permute(0,1) ))
##plt.show()

##second try
# img_np_arr_reshaped = train_image[0].reshape(IMAGE_WIDTH, IMAGE_HEIGHT) 
# plt.imshow(img_np_arr_reshaped)
# plt.show()

# plt.imshow(np.transpose(train_image[0], (1,0)), interpolation='nearest')
# plt.show()



def accuracy(y_true, y_pred):
    return torch.mean((y_pred == y_true).type(torch.FloatTensor))

def softmax(X):
    eX = torch.exp(X)
    return (eX.transpose(0, 1) / eX.sum(dim=1)).transpose(0, 1)

def cross_entropy(model, y_pred, y_train):
    m = y_pred.shape[0]

    prob = softmax(y_pred)
    #print(m, y_train)
    log_like = -torch.log(prob[range(m), y_train])

    data_loss = torch.sum(log_like) / m

    return data_loss


def dcross_entropy(y_pred, y_train):
    m = y_pred.shape[0]

    grad_y = softmax(y_pred)
    grad_y[torch.arange(0,m), y_train] -= 1.
    grad_y /= m

    return grad_y

## Keeping track of 2d convolutions from multiple image channels and multiple data points
import torch.nn.functional as F

def get_im2col_indices(x_shape, field_height, field_width, padding=12, stride=2):
    # First figure out what the size of the output should be
    #  N is the number of images
    #  C is the number of channels (RGB = 3, BW = 1, ...)
    #  H is the image height
    #  W is the is the image width
    N, C, H, W = x_shape
    assert (H + 2 * padding - field_height) % stride == 0
    assert (W + 2 * padding - field_height) % stride == 0
    
    # Output height and width
    out_height = int((H + 2 * padding - field_height) / stride + 1)
    out_width = int((W + 2 * padding - field_width) / stride + 1)

    i0 = np.repeat(np.arange(field_height), field_width)
    i0 = np.tile(i0, C)
    i1 = stride * np.repeat(np.arange(out_height), out_width)
    j0 = np.tile(np.arange(field_width), field_height * C)
    j1 = stride * np.tile(np.arange(out_width), out_height)
    
    i = i0.reshape(-1, 1) + i1.reshape(1, -1)
    j = j0.reshape(-1, 1) + j1.reshape(1, -1)

    k = np.repeat(np.arange(C), field_height * field_width).reshape(-1, 1)

    return (k.astype(int), i.astype(int), j.astype(int))


def im2col_indices(x, field_height, field_width, padding=1, stride=1):
    """ An implementation of im2col using indices """
    # Modified by Bruno Ribeiro to work with pytorch
    # Zero-pad the input
    p = padding
    x_padded = F.pad(x, (p,p,p,p), "constant", 0)

    k, i, j = get_im2col_indices(x.shape, field_height, field_width, padding, stride)

    cols = x_padded[:, k, i, j]
    C = x.shape[1]
    cols = cols.permute(1, 2, 0).reshape(field_height * field_width * C, -1)
    return cols


def col2im_indices(cols, x_shape, field_height=3, field_width=3, padding=4,
                   stride=3):
    """ An implementation of col2im based on fancy indexing and np.add.at """
    N, C, H, W = x_shape
    H_padded, W_padded = H + 2 * padding, W + 2 * padding
    x_padded = torch.zeros((N, C, H_padded, W_padded), dtype=cols.dtype)
    k, i, j = get_im2col_indices(x_shape, field_height, field_width, padding, stride)
    cols_reshaped = cols.reshape(C * field_height * field_width, -1, N)
    cols_reshaped = cols_reshaped.permute(2, 0, 1)
    x_padded_np = x_padded.numpy()
    np.add.at(x_padded_np, (slice(None), k, i, j), cols_reshaped.numpy())
    x_padded = torch.tensor(x_padded_np)
    if padding == 0:
        return x_padded
    return x_padded[:, :, padding:-padding, padding:-padding]

class ConvNet(object):
    def __init__(self, no_filters, Classes, FCHiddenNeurons):
        self.params = dict(
                    W1=torch.randn(no_filters, 3, 3, 3,device=device) / np.sqrt(no_filters / 2.),
                    W2=torch.randn(no_filters * IMAGE_HEIGHT//2 * IMAGE_WIDTH//2, FCHiddenNeurons,device=device) / np.sqrt((no_filters * IMAGE_HEIGHT/2 * IMAGE_WIDTH/2) / 2.),
                    W3=torch.randn(FCHiddenNeurons, Classes,device=device) / np.sqrt(FCHiddenNeurons / 2.),
                    b1=torch.zeros((no_filters, 1),device=device),
                    b2=torch.zeros((1, FCHiddenNeurons),device=device),
                    b3=torch.zeros((1, Classes),device=device)
                )

    # Forward pass    
    def forward(self, X):

        # Conv-1
        h1, h1_cache = self.conv_forward(X, self.params['W1'], self.params['b1'])
        h1, nl_cache1 = self.relu_forward(h1)
        #print(h1,nl_cache1)
        # Pool-1
        hpool, hpool_cache = self.maxpool_forward(h1)
        h2 = hpool.reshape(X.shape[0], -1).to(device)

        # FC-7
        h3, h3_cache = self.fc_forward(h2, self.params['W2'], self.params['b2'])
        h3, nl_cache3 = self.relu_forward(h3)

        # Softmax
        score, score_cache = self.fc_forward(h3, self.params['W3'], self.params['b3'])

        return score, (X, h1_cache, h3_cache, score_cache, hpool_cache, hpool, nl_cache1, nl_cache3)

    # Backward pass    
    def backward(self, y_pred, y_train, cache):
        X, h1_cache, h3_cache, score_cache, hpool_cache, hpool, nl_cache1, nl_cache3 = cache

        # Output layer
        grad_y = dcross_entropy(y_pred, y_train)

        # FC-7
        dh3, dW3, db3 = self.fc_backward(grad_y, score_cache)
        dh3 = self.relu_backward(dh3, nl_cache3)

        dh2, dW2, db2 = self.fc_backward(dh3, h3_cache)
        dh2 = dh2.view(hpool.shape)

        # Pool-1
        dpool = self.maxpool_backward(dh2, hpool_cache)

        # Conv-1
        dh1 = self.relu_backward(dpool, nl_cache1)
        dX, dW1, db1 = self.conv_backward(dh1, h1_cache)

        grad = dict(
            W1=dW1, W2=dW2, W3=dW3, b1=db1, b2=db2, b3=db3
        )

        return grad

    # Define 2d convolution forward pass    
    def conv_forward(self, X, W, b, stride=1, padding=1):
        n_filters, d_filter, h_filter, w_filter = W.shape
        n_x, d_x, h_x, w_x = X.shape
        h_out = (h_x - h_filter + 2 * padding) / stride + 1
        w_out = (w_x - w_filter + 2 * padding) / stride + 1

        if not h_out.is_integer() or not w_out.is_integer():
            raise Exception('Invalid output dimension!')

        h_out, w_out = int(h_out), int(w_out)

        X_col = im2col_indices(X, h_filter, w_filter, padding=padding, stride=stride)
        W_col = W.reshape(n_filters, -1)

        out = W_col @ X_col + b
        out = out.reshape(n_filters, h_out, w_out, n_x)
        out = out.permute(3, 0, 1, 2)

        cache = (X, W, b, stride, padding, X_col)

        return out, cache

    
    # Define 2d convolution backward pass    
    def conv_backward(self, dout, cache):
        X, W, b, stride, padding, X_col = cache
        n_filter, d_filter, h_filter, w_filter = W.shape

        db = torch.sum(dout, dim=(0, 2, 3))
        db = db.reshape(n_filter, -1)

        dout_reshaped = dout.permute(1, 2, 3, 0).reshape(n_filter, -1)
        dW = dout_reshaped @ X_col.transpose(0,1)
        dW = dW.reshape(W.shape)

        W_reshape = W.view(n_filter, -1)
        dX_col = W_reshape.transpose(0,1) @ dout_reshaped
        dX = col2im_indices(dX_col.cpu(), X.shape, h_filter, w_filter, padding=padding, stride=stride)

        return dX, dW, db

    # Define fully-connected layer, forward pass    
    def fc_forward(self, X, W, b):
        out = X @ W + b
        cache = (W, X)
        return out, cache


    # Define fully-connected layer, backward pass    
    def fc_backward(self, dout, cache):
        W, h = cache

        dW = h.transpose(0,1) @ dout
        db = torch.sum(dout, dim=0)
        dX = dout @ W.transpose(0,1)

        return dX, dW, db


    # Define ReLU forward pass    
    def relu_forward(self, X):
        out = X.clone()
        out[X <= 0] = 0
        cache = X
        return out, cache


    # Define ReLU backward pass    
    def relu_backward(self, dout, cache):
        dX = dout.clone().to(device)
        dX[cache <= 0] = 0
        return dX

    # Define maxpool forward pass    
    def maxpool_forward(self, X, size=2, stride=2):
        def maxpool(X_col):
            max_idx = torch.argmax(X_col, dim=0)
            out = X_col[max_idx, torch.arange(0,max_idx.shape[0])]
            return out, max_idx

        return self._pool_forward(X, maxpool, size, stride)


    # Define maxpool backward pass    
    def maxpool_backward(self, dout, cache):
        def dmaxpool(dX_col, dout_col, pool_cache):
            dX_col[pool_cache, torch.arange(0,dout_col.shape[0])] = dout_col
            return dX_col

        return self._pool_backward(dout, dmaxpool, cache)


    # Define maxpool function that gives forward pass. 
    #  The only goal of this function is to find which indices will move forward.   
    def _pool_forward(self, X, pool_fun, size=2, stride=2):
        n, d, h, w = X.shape
        h_out = (h - size) / stride + 1
        w_out = (w - size) / stride + 1

        if not w_out.is_integer() or not h_out.is_integer():
            raise Exception('Invalid output dimension!')

        h_out, w_out = int(h_out), int(w_out)

        X_reshaped = X.reshape(n * d, 1, h, w)
        X_col = im2col_indices(X_reshaped.cpu(), size, size, padding=0, stride=stride)

        out, pool_cache = pool_fun(X_col)

        out = out.reshape(h_out, w_out, n, d)
        out = out.permute(2, 3, 0, 1)

        cache = (X, size, stride, X_col, pool_cache)

        return out, cache


    # Define maxpool function that gives backward pass
    #  The only goal of this function is to keep track where the winning neuron came from, so we can backprop to it.
    #  Note that one neuron might be the winner of multiple patches
    def _pool_backward(self, dout, dpool_fun, cache):
        X, size, stride, X_col, pool_cache = cache
        n, d, w, h = X.shape

        dX_col = torch.zeros_like(X_col,device=device)
        dout_col = dout.permute(2, 3, 0, 1)
        dout_col = dout_col.contiguous().view(1,-1)

        dX = dpool_fun(dX_col, dout_col, pool_cache)

        dX = col2im_indices(dX_col.cpu(), (n * d, 1, h, w), size, size, padding=0, stride=stride)
        dX = dX.reshape(X.shape)

        return dX

model = ConvNet(no_filters = 32, Classes = 100, FCHiddenNeurons = 128)

lr = 5e-3

num_epochs = 30

for epoch in range(num_epochs):
    for i, (images, labels) in enumerate(train_loader):
        # Get an image and its label
        
        images.data = images.data.to(device)
        #print(images.data)
        #break
        labels = labels.to(device)
        #print (labels)
        y_pred, cache = model.forward(images.data)
        loss = cross_entropy(model.params, y_pred, labels)
        grad = model.backward(y_pred, labels, cache)
        
        for param in grad:
            model.params[param] -= lr * grad[param]
        
        if i % 20 == 0:
            print (f'Epoch: {epoch}, mini-batch {i}, NLL Loss: {loss.data}')

            
print("The End")

accuracy_val = 0.

for i, (images, labels) in enumerate(test_loader):
    # Get an image and its label

    images.data = images.data.to(device)
    labels = labels.to(device)

    y_pred, _ = model.forward(images.data)
    y_pred = torch.argmax(y_pred,dim=1)
    
    # Compute average (online)
    accuracy_val = (accuracy_val*i)/(i+1.) + accuracy(y_pred,labels)/(i+1.)
    

print(f'Accuracy {accuracy_val}')